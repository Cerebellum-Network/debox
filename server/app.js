/* eslint-disable import/no-extraneous-dependencies,max-len */
import { DdcClient } from '@cere-ddc-sdk/ddc-client';

const options = { clusterAddress: 2n };

// The secret phrase is going to be used to sign requests and encrypt/decrypt (optional) data
// Replace mnemonicGenerate by your secret phrase generated during account setup (see https://docs.cere.network/ddc/developer-guide/setup)
const secretPhrase = 'output surge impulse bid state clarify address upset since expect say reunion';

// Initialise DDC client and connect to blockchain
const ddcClient = await DdcClient.buildAndConnect(options, secretPhrase);
console.log('DDC Client successfully connected.');

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

const bucketCreatedEvent = await ddcClient.createBucket(balance, size, storageClusterId, parameters);
console.log(`Successfully created bucket. Id: ${bucketCreatedEvent.bucketId}`);
