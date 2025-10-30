# Solara Soundscapes Frontend

Immersive floating-island interface for a Solana-powered audio NFT marketplace. Built with React, Vite, Framer Motion, and Solana wallet adapters.

## Features

- Animated landing experience with gold-line aurora floating aesthetic.
- Phantom wallet connect/disconnect powered by `@solana/wallet-adapter-react`.
- Mock marketplace grid with SoundCloud embeds, buy/contact actions, and floating tile motion.
- Responsive layout, dark accessibility-conscious palette, and reduced-motion fallbacks.

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

- Development server: `http://localhost:5173`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Key Files

- `src/App.jsx` – toggles landing vs. marketplace based on wallet connection.
- `src/components/FloatingBackground.jsx` – gold line animations + spinning disk.
- `src/pages/LandingPage.jsx` / `src/pages/MarketplacePage.jsx` – primary screens.
- `src/data/listings.js` – mock NFT listing metadata and SoundCloud track URLs.

## Next Steps

1. Replace mock buy/contact handlers with on-chain transactions and messaging.
2. Wire the SoundCloud embeds to dynamic metadata or user-generated content.
3. Integrate analytics and user onboarding flows for first-time collectors.
4. Expand accessibility testing (keyboard focus states, screen-reader copy).

