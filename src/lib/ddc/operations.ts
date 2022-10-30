import { InjectedAccount, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { DdcClient, DEVNET } from '@cere-ddc-sdk/ddc-client/browser';
import { unwrap } from 'src/lib/unwrap';
import { web3Enable } from '@polkadot/extension-dapp';
import { findAccount } from '../utils';
import { get } from '../local';

export async function createClient(account: InjectedAccount, secret: string) {
  return DdcClient.buildAndConnect(
    {
      clusterAddress: Number(process.env.REACT_APP_CLUSTER_ID),
      smartContract: DEVNET,
      fileOptions: {
        parallel: 2,
        pieceSizeInBytes: 1024 * 1024 * 30,
      },
    },
    account,
    secret,
  );
}

type InitResult = {
  client: DdcClient;
  account: InjectedAccountWithMeta;
  bucket: bigint;
};

export async function initClient(): Promise<Partial<InitResult>> {
  const result: Partial<InitResult> = { client: undefined, account: undefined };
  try {
    const address = get('address');
    const secret = get('secret');
    const bucket = get('bucket');
    await web3Enable(String(process.env.REACT_APP_NAME));
    const account = await findAccount(unwrap(address));
    result.account = unwrap(account);
    result.bucket = BigInt(bucket ?? '');
    result.client = await createClient(account, unwrap(secret));
    return result;
  } catch (e) {
    return result;
  }
}
