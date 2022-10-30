import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { unwrap } from './unwrap';

export async function loadInjectedAccounts(): Promise<InjectedAccountWithMeta[]> {
  await web3Enable(String(process.env.REACT_APP_NAME));
  return web3Accounts();
}

export async function findAccount(address: string): Promise<InjectedAccountWithMeta> {
  const accounts = await loadInjectedAccounts();
  return unwrap(
    accounts.find((user) => user.address === address),
    `A user [${address}] not found`,
  );
}
