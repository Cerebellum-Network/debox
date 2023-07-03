import { Tag } from '@cere-ddc-sdk/ddc-client/browser';
import { u8aToString } from '@polkadot/util';
import { decode } from 'varint';

export class File {
  constructor(
    public name: string = '',
    public type: string = '',
    public size: string = '',
    public dateAdded: string = '',
    public cid: string = '',
  ) {}
}

export function convertTags(tags: Tag[]): { key: string; value: string | number }[] {
  return tags.map((tag) => {
    const key = u8aToString(tag.key);
    return ({ key, value: key === 'timestamp' ? decode(tag.value) : u8aToString(tag.value) });
  });
}
