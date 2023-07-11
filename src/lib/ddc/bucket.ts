import { DdcClient } from '@cere-ddc-sdk/ddc-client/browser';
import { createDdcContract } from '../../blockchain/tools';
import { isRecord } from '../types/is-record';
import { isNumber } from '../types/is-number';

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
  const storageClusterId = BigInt(process.env.REACT_APP_STORAGE_CLUSTER_ID ?? '');

  const event = await client.createBucket(balance, size, storageClusterId, parameters);
  return event.bucketId;
}

type Bucket = {
  bucketId: number;
};

const isBucket = (val: unknown): val is Bucket => isRecord(val) && isNumber(val.bucketId) && val.bucketId > 0;
const isBucketArray = (val: unknown): val is Bucket[] => Array.isArray(val) && val.every(isBucket);

type Contract = Awaited<ReturnType<typeof createDdcContract>>['contract'];
type Params = {
  offset: bigint;
  limit: bigint;
  account: string;
};

async function getBuckets(contract: Contract, { offset, limit, account }: Params): Promise<Bucket[]> {
  const tx = await contract.query.bucketList(account, {}, offset, limit, account);
  if (tx.result.isOk) {
    const data = tx.output?.toJSON();
    const list = Array.isArray(data) ? Array.from(data)[0] : [];
    return isBucketArray(list) ? list : [];
  }
  return [];
}

export async function bucketsList(account: string): Promise<Bucket[]> {
  const { contract, api } = await createDdcContract();
  const result: Bucket[] = [];
  let offset = 0n;
  const limit = 500n;
  let buckets = await getBuckets(contract, { offset, limit, account });
  result.push(...buckets);
  while (buckets.length > 0) {
    offset += limit;
    // eslint-disable-next-line no-await-in-loop
    buckets = await getBuckets(contract, { offset, limit, account });
    result.push(...buckets);
  }
  await api.disconnect();
  return result;
}
