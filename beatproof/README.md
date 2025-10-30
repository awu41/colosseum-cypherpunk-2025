# Beatproof - Solana Audio NFT Marketplace

Immersive floating-island interface for a Solana-powered audio NFT marketplace. Built with Next.js, React, TypeScript, Framer Motion, Solana wallet adapters, and a serverless API backend.

## Features

- Animated landing experience with gold-line aurora floating aesthetic.
- Phantom wallet connect/disconnect powered by `@solana/wallet-adapter-react`.
- Mock marketplace grid with SoundCloud embeds, buy/contact actions, and floating tile motion.
- Dedicated `/sell` flow for submitting new listings with SoundCloud + Telegram metadata.
- Phantom wallet login creates a signed-in session cookie for backend API calls.

## Wallet Session Flow

When a user connects Phantom, the app:

1. Calls `connect()` from `@solana/wallet-adapter-react`.
2. On success, posts the wallet address to `/api/session`.
3. The API route stores the address in an HTTP-only cookie `beatproof-session` (7 day TTL).
4. Disconnecting clears the cookie via a DELETE request.

All subsequent backend requests can read `beatproof-session` to identify the user; no private keys or signatures are stored.
- Responsive layout, dark accessibility-conscious palette, and reduced-motion fallbacks.

## Getting Started
```bash
cd beatproof
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
  - `api/` – Serverless API endpoints (see API.md)
- `src/components/` – Reusable React components
  - All components are client components with 'use client' directive
- `src/data/` – Mock data and listings
- `src/lib/` – Utility functions for Solana, Anchor, and API builders
- `src/providers/` – React context providers (Wallet integration)

## Backend API

See `API.md` for complete API documentation.

**Core Endpoints:**
- `GET /api/health` - Health check
- `POST /api/license/get` - Fetch license by beat hash
- `POST /api/license/exists` - Check if license exists
- `POST /api/license/has-active` - Check if license is active
- `POST /api/ix/license/initialize` - Build initialize transaction
- `POST /api/ix/license/revoke` - Build revoke transaction
- `POST /api/tx/simulate` - Simulate transaction

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
