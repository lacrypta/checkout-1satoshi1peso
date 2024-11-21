import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

import './globals.css';
import { LaWalletConfig } from '@lawallet/react';
import AppWrapper from '@/components/wrapper';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Ticketing - La Crypta',
  description: 'Ticketing para eventos de La Crypta',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn('min-h-screen font-sans antialiased', inter.variable)}
      >
        <AppWrapper>{children}</AppWrapper>
        <Toaster />
      </body>
    </html>
  );
}
