# Beatproof Frontend

Immersive floating-island interface for a Solana-powered audio NFT marketplace. Built with Next.js, React, TypeScript, Framer Motion, and Solana wallet adapters.

## Features

- Animated landing experience with gold-line aurora floating aesthetic.
- Phantom wallet connect/disconnect powered by `@solana/wallet-adapter-react`.
- Mock marketplace grid with SoundCloud embeds, buy/contact actions, and floating tile motion.
- Responsive layout, dark accessibility-conscious palette, and reduced-motion fallbacks.

## Getting Started
```bash
cd app
npm install
npm run dev
```

- Development server: `http://localhost:3000`
- Build for production: `npm run build`
- Start production server: `npm start`

## Project Structure

- `src/app/` – Next.js app router pages and layouts
  - `page.tsx` – Main landing page with wallet integration
  - `layout.tsx` – Root layout with WalletContextProvider
  - `api/` – API routes for health checks and license fetching
- `src/components/` – Reusable React components
  - All components are client components with 'use client' directive
- `src/data/` – Mock data and listings
- `src/lib/` – Utility functions for Solana and Anchor
- `src/providers/` – React context providers (Wallet integration)

## Migration from Vite

This project has been migrated from Vite to Next.js 14 with:
- App Router architecture
- TypeScript support
- Server and Client components
- API routes for backend integration
- Same UI/UX and functionality

## Next Steps

1. Replace mock buy/contact handlers with on-chain transactions and messaging.
2. Wire the SoundCloud embeds to dynamic metadata or user-generated content.
3. Integrate analytics and user onboarding flows for first-time collectors.
4. Expand accessibility testing (keyboard focus states, screen-reader copy).
