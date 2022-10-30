import { Tag } from '@cere-ddc-sdk/ddc-client/browser';
import { u8aToString } from '@polkadot/util';

export class File {
  constructor(
    public name: string = '',
    public type: string = '',
    public size: string = '',
    public dateAdded: string = '',
    public cid: string = '',
  ) {}
}

export function convertTags(tags: Tag[]): { key: string; value: string }[] {
  return tags.map((tag) => ({ key: u8aToString(tag.key), value: u8aToString(tag.value) }));
}
