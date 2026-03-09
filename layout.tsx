/**
 * PumpGuard Shield - Root Layout
 * Phase 1: The Shield (Safety Layer)
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PumpGuard Shield | Solana Token Safety Analyzer',
  description: 'Instant safety analysis for any Solana token. Check holders, authorities, liquidity, and whale activity before you trade.',
  keywords: ['solana', 'token', 'safety', 'rug pull', 'crypto', 'pump.fun', 'raydium'],
  authors: [{ name: 'PumpGuard' }],
  openGraph: {
    title: 'PumpGuard Shield',
    description: 'Is this token safe? Get an instant safety report.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
