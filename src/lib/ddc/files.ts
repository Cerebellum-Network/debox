import { DdcClient, SearchType, Tag } from '@cere-ddc-sdk/ddc-client/browser';
import { File as DdcFile, Query, DdcUri } from '@cere-ddc-sdk/ddc-client';
import { stringToU8a } from '@polkadot/util';

export async function uploadFile(
  address: string,
  ddcClient: DdcClient,
  bucketId: bigint,
  file: File,
  path: string,
) {
  const tags = [
    new Tag('Path', path),
    // Tags are searchable by default. In this example piece can be found by `user address`
    new Tag('userId', address),
    new Tag('Name', file.name),
    new Tag('Type', file.type),
    new Tag('Kind', 'File'),
    new Tag('Date added', Math.round(new Date().getTime() / 1000).toString()),
    new Tag('Size', String(file.size), SearchType.NOT_SEARCHABLE),
  ];

  // Tags are optional
  // Data supported types: ReadableStream<Uint8Array> | string | Uint8Array
  const ddcFile = new DdcFile(file.stream() as any, tags);

  const storeOptions = {
    // True - store encrypted data. False - store unencrypted data.
    encrypt: true,
    // If empty or not passed - data will be encrypted by master DEK.
    dekPath: path,
  };

  await ddcClient.store(bucketId, ddcFile, storeOptions);
}

export async function createFolder(ddcClient: DdcClient, bucket: bigint, path: string, folder: string) {
  const tags = [
    new Tag('Path', path),
    // Tags are searchable by default. In this example piece can be found by `user address`
    new Tag('Name', folder),
    new Tag('Type', 'Folder'),
    new Tag('Kind', 'Folder'),
  ];
  const ddcFile = new DdcFile(stringToU8a(folder), tags);
  await ddcClient.store(bucket, ddcFile, { encrypt: true, dekPath: path });
}

export async function loadFiles(ddcClient: DdcClient, bucketId: bigint, path: string) {
  const query: Query = {
    bucketId,
    tags: [new Tag('Path', path)],
    skipData: false,
  };
  return ddcClient.search(query);
}

export async function readFile(ddcClint: DdcClient, bucket: bigint, cid: string, path: string) {
  return ddcClint.read(DdcUri.build(bucket, cid), { decrypt: true, dekPath: path });
}
