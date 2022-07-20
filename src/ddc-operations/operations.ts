/* eslint-disable max-len */
import { InjectedAccount, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import {
  DdcClient, File as DdcFile, SearchType, Tag,
} from '@cere-ddc-sdk/ddc-client/browser';
import { unwrap } from 'src/unwrap';
import { web3Enable } from '@polkadot/extension-dapp';
import { findAccount } from '../utils';
import { get } from '../local';

export async function createClient(account: InjectedAccount, secret: string) {
  return DdcClient.buildAndConnect({
    clusterAddress: Number(process.env.REACT_APP_CLUSTER_ID),
  }, account, secret);
}

export async function createBucket(client: DdcClient): Promise<bigint> {
  // Amount of tokens to deposit to the bucket balance
  const balance = 10n;
  // Bucket size in GB
  const size = 5n;
  // Bucket parameters
  const parameters = {
    // Number of copies of each piece. Minimum 1. Maximum 9. Temporary limited to 3. Default 1.
    replication: 3,
  };
  // Id of the storage cluster on which the bucket should be created
  // Storage custer ids can be found here: https://docs.cere.network/testnet/ddc-network-testnet
  const storageClusterId = 1n;

  const event = await client.createBucket(balance, size, storageClusterId, parameters);
  return event.bucketId;
}

export async function bucketsList(client: DdcClient, account: string) {
  return client.bucketList(0n, 100n, account);
}

export async function uploadFile(address: string, ddcClient: DdcClient, bucketId: bigint, file: File) {
  const tags = [
    // Tags are searchable by default. In this example piece can be found by `usedId`
    new Tag('userId', address),
    // To store metadata, not searchable tags  can be used (they are filtered out during piece indexing)
    new Tag('Name', file.name),
    new Tag('Type', file.type),
    new Tag('Size', String(file.size), SearchType.NOT_SEARCHABLE),
  ];

  // Tags are optional
  // Data supported types: ReadableStream<Uint8Array> | string | Uint8Array
  const ddcFile = new DdcFile(file.stream() as any, tags);

  const storeOptions = {
    // True - store encrypted data. False - store unencrypted data.
    encrypt: true,
    // If empty or not passed - data will be encrypted by master DEK.
    // dekPath: '/documents/personal',
  };

  const ddcUri = await ddcClient.store(bucketId, ddcFile, storeOptions);
  console.log(`Successfully uploaded file. DDC URI: ${ddcUri.toString()}`);
}

type InitResult = {
  client: DdcClient;
  account: InjectedAccountWithMeta;
};
export async function initClient(): Promise<Partial<InitResult>> {
  const result: Partial<InitResult> = { client: undefined, account: undefined };
  try {
    const publicKey = get('publicKey');
    const secret = get('secret');
    await web3Enable(String(process.env.REACT_APP_NAME));
    const account = await findAccount(unwrap(publicKey));
    result.account = unwrap(account);
    result.client = await createClient(account, unwrap(secret));
    return result;
  } catch (e) {
    return result;
  }
}
