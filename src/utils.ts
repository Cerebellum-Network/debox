// import {
//   ContentAddressableStorage,
//   Scheme,
//   SchemeInterface,
// } from '@cere-ddc-sdk/content-addressable-storage';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
// import { waitReady } from '@polkadot/wasm-crypto';
// import { u8aToHex } from '@polkadot/util';
// import { decodeAddress } from '@polkadot/util-crypto';
// eslint-disable-next-line max-len
// import { FileStorageInterface } from '@cere-ddc-sdk/file-storage/dist/core/FileStorage.interface';
// import { FileStorage } from '@cere-ddc-sdk/file-storage';
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

// export async function getContentAddressableStorage(
//   mode: string,
//   privateKey: string,
// ): Promise<ContentAddressableStorage> {
//   let scheme: SchemeInterface;
//   if (mode === 'full') {
//     await web3Enable(String(process.env.REACT_APP_NAME));
//     const accounts = await web3Accounts();
//     const account = accounts.find(
//       (acc) => acc.address === '5GzbK1pvtobWFThuajzctw9YvBg8raPcv58YsEP77mUcX5k4',
//     );
//
//     await waitReady();
//
//     const injector = await web3FromAddress(unwrap(account).address);
//     const { signRaw } = injector.signer;
//
//     if (!signRaw) {
//       throw Error('Failed to initialise scheme');
//     }
//
//     const publicKeyHex = u8aToHex(decodeAddress(unwrap(account).address));
//
//     scheme = {
//       name: 'sr25519',
//       publicKeyHex,
//       sign: async (data: Uint8Array): Promise<string> => {
//         const { signature } = await signRaw({
//           address: unwrap(account).address,
//           data: u8aToHex(data),
//           type: 'bytes',
//         });
//
//         return signature;
//       },
//     };
//   } else {
//     scheme = await Scheme.createScheme('sr25519', privateKey);
//   }
//
//   return new ContentAddressableStorage(scheme, String(process.env.REACT_APP_NODE_URL));
// }
//
// export async function getFileStorage(privateKey: string): Promise<FileStorageInterface> {
//   const scheme = await Scheme.createScheme('sr25519', privateKey);
//
//   return new FileStorage(scheme, String(process.env.REACT_APP_NODE_URL));
// }
