# Beatproof Backend Overview

This document captures the current state of the backend logic that lives inside the `beatproof/` Next.js application. All server functionality is implemented as App Router API routes and interacts directly with the Anchor-generated Solana program.

## Current Architecture

- **Framework**: Next.js 14 App Router. Backend runs as serverless API routes colocated with the UI.
- **Program bindings**: `src/lib/anchor/program.ts` creates an Anchor `Program` using the generated IDL in `src/idl/soundcloud_license.json`. RPC endpoint and program ID come from environment (`ANCHOR_PROVIDER_URL`, `PROGRAM_ID`).
- **Utilities**:
  - `src/lib/solana/pda.ts` derives the license PDA (`seed: "license" + beatHash`).
  - `src/lib/solana/builders.ts` (async) builds initialize/revoke `TransactionInstruction`s and base64 serialized transactions.
  - `src/lib/solana/serde.ts` serializes/deserializes transactions (used by the simulate endpoint).
- **Account model**: Mirrors the Anchor `License` account (issuer, beat hash, CID, type, territory, valid until, revoked flag). TypeScript shape comes from the IDL.
- **Environment**: Requires `ANCHOR_PROVIDER_URL`, `PROGRAM_ID`; optional knobs documented in `env.example`.

## API Surface (`src/app/api`)

| Route | Method & Body | Purpose |
|-------|---------------|---------|
| `/api/health` | `GET` | Simple liveness probe returning `{ ok: true }`. Useful for uptime checks and Vercel health monitoring. |
| `/api/license-get` | `POST { beatHashHex }` | Fetches the on-chain license account. Returns the derived PDA and raw account data. 404 if the account does not exist. |
| `/api/license/exists` | `POST { beatHashHex }` | Boolean existence check for a license PDA without returning data. |
| `/api/license/has-active` | `POST { beatHashHex, territory? }` | Validates license status: not revoked, not expired, optional territory match. Returns `{ active: boolean, reason? }`. |
| `/api/ix/license/initialize` | `POST { beatHashHex, termsCid, licenseType, territory, validUntil, issuer }` | Builds a base64 serialized transaction for the `initialize` instruction. Caller must set `recentBlockhash`/`feePayer`, sign, and submit. |
| `/api/ix/license/revoke` | `POST { beatHashHex, issuer }` | Builds a base64 serialized transaction for the `revoke` instruction. Same client-side responsibilities as above. |
| `/api/tx/simulate` | `POST { txBase64 }` | Deserializes a transaction, simulates it on the configured cluster, and returns execution logs / errors. |
| `/api/soundcloud/auth-url` | `GET ?state&scope&redirectUri` | Returns the OAuth authorize URL for SoundCloud, supporting optional state/scope overrides. |
| `/api/soundcloud/token` | `POST { code, redirectUri? }` | Exchanges an authorization code for a SoundCloud access token (non-expiring scope by default). |
| `/api/soundcloud/verify-track` | `POST { accessToken, trackId?|trackUrl?, expectedUserId?, expectedBeatHash? }` | Confirms the authenticated SoundCloud user owns the target track and optionally checks that metadata references a beat hash. |

All endpoints share common traits:
- Zod validation for inputs.
- Direct use of `getProgram()`; no separate Express layer.
- Errors respond with `{ error, details? }` and appropriate status codes.

## Current Capabilities & Limitations

- ✅ Can read license state and validate status directly from Solana.
- ✅ Can generate transaction payloads for clients to sign (initialize/revoke).
- ✅ Can simulate transactions for pre-flight checks.
- ✅ Can complete the SoundCloud OAuth handshake and verify track ownership before license creation.
- ⚠️ No persistence beyond on-chain data (no PostgreSQL/Prisma layer yet).
- ⚠️ No authentication/authorization: any caller can hit the endpoints.
- ⚠️ No rate limiting or caching; relies on RPC throughput.
- ⚠️ All tx builders send unsigned transactions—clients must handle signing & submission.

## Recommended Next Steps

1. **Program capability parity**: confirm the Anchor program covers all desired license features (expiration enforcement, SoundCloud binding, exclusivity rules). Add new IDL + builders as program evolves.
2. **Auth & Access Control**: introduce wallets/SIWS or API keys so only authenticated producers/artists hit sensitive endpoints.
3. **SoundCloud integration**: persist verification artifacts and wire verify-track results into the mint flow (block initialize when ownership/hash checks fail).
4. **Persistence layer**: add Prisma/PostgreSQL (or Supabase) for off-chain metadata, audit logs, and linkage between SoundCloud IDs and license PDAs.
5. **Validation hardening**: enforce stronger schema checks (e.g., CID format, territory enums), add structured error codes, and consider logging.
6. **Operational tooling**: instrument Prometheus/Vercel logs, add rate limiting, and provide staging configuration (separate RPC URLs/program IDs).
7. **DX improvements**: export a typed client for the API, add integration tests (e.g., using Anchor localnet) to guard against regressions.

## Deployment Notes

- Deploying through Vercel requires setting the Root Directory to `beatproof/` and defining the expected environment variables.
- Build command: `npm run build`; output directory defaults to `.next`.
- Ensure `PROGRAM_ID` matches the deployed Anchor program on the target cluster (devnet/localnet/mainnet).

## Open Questions / Follow-ups

- Do we need signer-side helpers (e.g., for fee payer assignment) or wallet adapter integration to pair with the generated transactions?
- Should revoked/expired status be cached or indexed for faster public verification?
- Where should SoundCloud verification artifacts live (IPFS vs. DB), and how long do we cache access tokens?

This overview should stay in sync with backend changes so the team has a single reference for Beatproof’s server functionality.***
