import { DdcClient, SearchType, Tag } from '@cere-ddc-sdk/ddc-client/browser';
import { DdcUri, File as DdcFile, Piece as DdcPiece, Query } from '@cere-ddc-sdk/ddc-client';
import { stringToU8a } from '@polkadot/util';
import { encode } from 'varint';
import { convertTags } from '../../file';

export const buildPath = (path: string): string => ['Files', path].filter(Boolean).join('/');

export async function uploadFile(
  address: string,
  ddcClient: DdcClient,
  bucketId: bigint,
  file: File,
  path: string,
) {
  // eslint-disable-next-line no-debugger
  const tags = [
    new Tag('path', buildPath(path)),
    new Tag('file-path', [path, file.name].join('/')),
    new Tag('kind', 'file', SearchType.NOT_SEARCHABLE),
    new Tag('user-id', address),
    new Tag('name', file.name),
    new Tag('content-type', file.type),
    new Tag('timestamp', new Uint8Array(encode(Math.round(file.lastModified)))),
    new Tag('size', String(file.size), SearchType.NOT_SEARCHABLE),
  ];

  const ddcFile = new DdcFile(file.stream(), tags);

  // disable encryption for a while
  // const storeOptions = {
  //   // True - store encrypted data. False - store unencrypted data.
  //   encrypt: true,
  //   // If empty or not passed - data will be encrypted by master DEK.
  //   dekPath: path,
  // };

  await ddcClient.store(bucketId, ddcFile);
}

export async function createFolder(ddcClient: DdcClient, bucket: bigint, path: string, folder: string) {
  const tags = [
    new Tag('path', buildPath(path)),
    new Tag('name', folder),
    new Tag('kind', 'folder', SearchType.NOT_SEARCHABLE),
  ];
  const ddcFile = new DdcFile(stringToU8a(folder), tags);
  await ddcClient.store(bucket, ddcFile);
}

type Piece = Pick<DdcPiece, 'data' | 'cid'> & {
  tags: { key: string; value: string | number }[];
};

const sort = (a: Piece, b: Piece) => {
  const aNameTag = a.tags.find((t) => t.key === 'name') ?? { key: 'name', value: 'unknown' };
  const bNameTag = b.tags.find((t) => t.key === 'name') ?? { key: 'name', value: 'unknown' };
  return aNameTag.value.toString().toLowerCase().localeCompare(bNameTag.value.toString().toLowerCase());
};

export async function loadFiles(ddcClient: DdcClient, bucketId: bigint, path: string): Promise<Piece[]> {
  const query: Query = {
    bucketId,
    tags: [new Tag('path', buildPath(path))],
    skipData: false,
  };
  const files: Piece[] = [];
  const folders: Piece[] = [];
  (await ddcClient.search(query).catch(() => [])).forEach((ddcPiece) => {
    const tags = convertTags(ddcPiece.tags);
    const piece = { data: ddcPiece.data, tags, cid: ddcPiece.cid, links: ddcPiece.links };
    const kind = tags.find((tag) => tag.key === 'kind');
    if (kind?.value === 'file') {
      files.push(piece);
    } else if (kind?.value === 'folder') {
      folders.push(piece);
    }
  });
  files.sort(sort);
  folders.sort(sort);
  folders.push(...files);
  return folders;
}

export async function readFile(ddcClint: DdcClient, bucket: bigint, cid: string) {
  return ddcClint.read(DdcUri.build(bucket, cid));
}
