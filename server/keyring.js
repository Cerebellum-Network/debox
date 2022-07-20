import { Keyring } from '@polkadot/keyring';
import { waitReady } from '@polkadot/wasm-crypto';

await waitReady();
const keyring = new Keyring({ type: 'sr25519' });
// let account: AddressOrPair;
const secretPhraseOrAddress = 'output surge impulse bid state clarify address upset since expect say reunion';
// const account = keyring.addFromMnemonic(secretPhraseOrAddress, { name: 'sr25519' });
const account = keyring.addFromAddress('5GzbK1pvtobWFThuajzctw9YvBg8raPcv58YsEP77mUcX5k4');

console.log(account.toJson());
console.log(account.encryptMessage('dddd'));
