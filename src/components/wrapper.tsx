'use client';
import { createConfig, LaWalletConfig } from '@lawallet/react';

const config = createConfig({ relaysList: ['wss://relay.lawallet.ar'] });

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LaWalletConfig config={config}>{children}</LaWalletConfig>;
}
