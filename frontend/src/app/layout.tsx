import type { Metadata } from 'next';
import WalletContextProvider from '@/providers/WalletContextProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beatproof',
  description: 'Discover rare audio NFTs, unlock intimate artist experiences, and trade sonic moments secured on the Solana blockchain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}

