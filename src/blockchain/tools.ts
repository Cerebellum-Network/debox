import { ApiPromise, WsProvider } from '@polkadot/api';
import { DEVNET } from '@cere-ddc-sdk/ddc-client';
import { ContractPromise } from '@polkadot/api-contract';
import { chainConfig } from './config';

export const createApi = async () => {
  const api = await ApiPromise.create({
    provider: new WsProvider(DEVNET.rpcUrl),
    types: chainConfig,
  });
  await api.isReady;
  await api.rpc.system.chain();
  return api;
};

export async function createDdcContract() {
  const api = await createApi();
  return { api, contract: new ContractPromise(api, DEVNET.abi, DEVNET.contractAddress) };
}
