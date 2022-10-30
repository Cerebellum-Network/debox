import { DdcClient } from '@cere-ddc-sdk/ddc-client/browser';

type CreateParams = {
  // Amount of tokens to deposit to the bucket balance
  balance?: bigint;
  // Bucket size in GB
  size?: bigint;
  // Number of copies of each piece. Minimum 1. Maximum 9. Temporary limited to 3. Default 1.
  replication?: number;
};

export async function createBucket(client: DdcClient, params: CreateParams): Promise<bigint> {
  const { balance = 10n, size = 5n, replication = 3 } = params;
  const parameters = {
    replication,
  };
  // Id of the storage cluster on which the bucket should be created
  // Storage custer ids can be found here: https://docs.cere.network/testnet/ddc-network-testnet
  const storageClusterId = 1n;

  const event = await client.createBucket(balance, size, storageClusterId, parameters);
  return event.bucketId;
}

export async function bucketsList(client: DdcClient, account: string) {
  return client.bucketList(200n, 1000n, account);
}

export function bucketInfo(client: DdcClient, bucket: bigint) {
  return client.bucketGet(bucket);
}
