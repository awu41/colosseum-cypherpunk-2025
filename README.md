# SoundCloud License NFT - Solana Implementation

Full-stack dApp for blockchain-based music licensing on Solana where producers can mint revocable license NFTs and artists bind SoundCloud tracks with on-chain verification.

## Project Overview

Enable producers to mint NFTs representing music licenses with encoded terms, artists to bind SoundCloud tracks to these licenses via on-chain attestations, and public verification of license status.

## Tech Stack - Solana

- **Blockchain**: Solana (mainnet/devnet)
- **Programs**: Rust + Anchor framework
- **Tokens**: SPL Token (non-fungible licenses)
- **Backend**: Node.js/TypeScript, Express, Prisma + PostgreSQL, IPFS (Pinata)
- **Frontend**: Next.js 14, @solana/wallet-adapter, TailwindCSS
- **Integrations**: SoundCloud API (OAuth 2), EAS-like attestations on Solana

## Project Structure

```
soundcloud-license-nft/
├── programs/              # Solana programs (Rust + Anchor)
├── tests/                 # TypeScript integration tests  
├── backend/               # Express API + Prisma
├── frontend/              # Next.js app
└── README.md
```

## Key Features

### Smart Contract (Solana Program)
- Mint licenses as SPL tokens with metadata
- Producer retains ownership
- Artist references by mint address
- Revocation capability
- Expiry enforcement
- Exclusivity rules

### Backend API
- Authentication (SIWE via Solana wallet + SoundCloud OAuth)
- IPFS file uploads
- Beat hash computation
- License minting via program calls
- Track linking with attestations
- Verification endpoints
- Expiry checking jobs

### Frontend
- Producer dashboard (mint licenses, manage revocations)
- Artist dashboard (bind SoundCloud tracks)
- Public verifier page
- Solana wallet integration
