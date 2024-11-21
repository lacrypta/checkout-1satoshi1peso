import { createConfig, createSignerWithPrivateKey } from '@lawallet/react';

const signer = createSignerWithPrivateKey(
  process.env.NEXT_SIGNER_PRIVATE_KEY || ''
);

export const config = createConfig({
  federationId: 'lawallet.ar',
  endpoints: {
    lightningDomain: 'https://lawallet.ar',
    gateway: 'https://api.lawallet.ar',
  },
  relaysList: [
    'wss://relay.damus.io',
    'wss://relay.hodl.ar',
    'wss://relay.lawallet.ar',
  ],
  signer,
});
