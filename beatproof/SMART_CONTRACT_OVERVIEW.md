# Beatproof Smart Contract Overview

This document summarizes the current Solana program, account model, and automated
tests that live under the `soundcloud_license/` workspace. The program is
responsible for minting and revoking on-chain licenses that bind SoundCloud
tracks to wallet addresses.

## Program Metadata

- **Program name**: `soundcloud_license`
- **Program ID (devnet/localnet)**: `FYqcZuL5DUBUTTKx94oew8zZoX5rSR8WpEA3RJEXC457`
- **Source**: `soundcloud_license/programs/soundcloud_license/src/lib.rs`
- **IDL**: `beatproof/src/idl/soundcloud_license.json`
- **Client entrypoint**: `beatproof/src/lib/anchor/program.ts`

### Deployment Checklist (Devnet)

1. **Environment variables**
   - `ANCHOR_PROVIDER_URL=https://api.devnet.solana.com`
   - `PROGRAM_ID=FYqcZuL5DUBUTTKx94oew8zZoX5rSR8WpEA3RJEXC457`
   - Mirror these values in local `.env`, `env.example`, and Vercel project settings.
2. **Build and deploy**
   ```bash
   cd soundcloud_license
   anchor build
   anchor deploy --provider.cluster devnet
   ```
   Deploy keypair: `/Users/albert/.config/solana/id.json`. Ensure it holds ≥2 SOL on devnet before deploying (`solana balance`).
3. **Post-deploy validation**
   - Confirm program account:  
     `solana account FYqcZuL5DUBUTTKx94oew8zZoX5rSR8WpEA3RJEXC457 --url https://api.devnet.solana.com`
   - Record deploy signature (latest: `NGYXR2FmM8TgeLh5ZK62C76RS2s3Gb3kJb6vuSWSYKgYjdQiLh15J5BGHZ4ei9v6tNLYeHHVRzPk9toxwBFcuEq`).
   - Optional integration check: run `/api/ix/license/initialize` once and verify the transaction on explorer (`?cluster=devnet`).

## Accounts & PDA Layout

### License Account
| Field | Type | Description |
|-------|------|-------------|
| `issuer` | `Pubkey` | Wallet that created the license (producer). |
| `licensee` | `Pubkey` | Wallet that owns the license (buyer). |
| `beat_mint` | `Pubkey` | Mint address that represents the beat NFT. |
| `beat_hash` | `[u8; 32]` | Hash derived from the beat metadata / SoundCloud track. |
| `terms_cid` | `String` | IPFS CID (or other storage) describing license terms. |
| `license_type` | `LicenseType` | `Exclusive` or `NonExclusive`. |
| `territory` | `String` | Territory restrictions for the license. |
| `valid_until` | `i64` | Unix timestamp (seconds) when license expires. |
| `revoked` | `bool` | `true` after revocation. |

> PDA seeds: `["license", beat_hash, licensee]`

### License Guard Account
| Field | Type | Description |
|-------|------|-------------|
| `beat_hash` | `[u8; 32]` | Beat hash this guard protects. |
| `exclusive_active` | `bool` | Tracks whether an exclusive license is currently active. |

> PDA seeds: `["license_guard", beat_hash]`

The guard ensures only one active exclusive license per beat. It initializes lazily
the first time a license is created and toggles when exclusives are minted/revoked.

## Instructions

### `initialize`
**Args**
- `beat_hash: [u8; 32]`
- `licensee: Pubkey`
- `beat_mint: Pubkey`
- `terms_cid: String`
- `license_type: LicenseType`
- `territory: String`
- `valid_until: i64`

**Accounts**
- `license` (PDA, mut, init)
- `guard` (PDA, mut, init_if_needed)
- `signer` (mut, payer, issuer wallet)
- `system_program`

**Validation**
- Guard `beat_hash` must match the incoming `beat_hash`.
- Rejects new exclusive licenses if `exclusive_active` is already `true`.
- When successful, sets license fields and toggles guard for exclusives.

### `revoke`
**Accounts**
- `license` (mut)
- `guard` (mut)
- `signer` (issuer)

**Validation**
- Only the original issuer may revoke.
- Rejects already-revoked licenses.
- If the license is exclusive, clears the guard’s `exclusive_active` flag.

## Errors
| Code | Meaning |
|------|---------|
| `UnauthorizedRevoker` | Caller is not the license issuer. |
| `AlreadyRevoked` | License has already been revoked. |
| `ExclusiveLicenseExists` | A valid exclusive license is already active for the beat. |
| `GuardMismatch` | Guard account’s beat hash does not match the instruction input. |

## Events
- `LicenseInitialized { license, issuer, licensee, license_type }`
- `LicenseRevoked { license, revoked_by }`

These events are emitted during initialize and revoke, respectively.

## Testing Suite

Tests live in `soundcloud_license/tests/` and run via `anchor test` (which executes
`yarn ts-mocha`). The current scenarios are:

1. **Simple smoke test** (`simple.test.ts`): Verifies the test harness runs.
2. **Initialize a license** (`soundcloud_license.ts`):
   - Creates an exclusive license for a random beat hash.
   - Validates stored fields and guard state.
3. **Revoke a license** (`soundcloud_license.ts`):
   - Initializes a non-exclusive license and revokes it.
   - Confirms `revoked` flag flips and guard resets.
4. **Multiple non-exclusive buyers** (`soundcloud_license.ts`):
   - Mints two non-exclusive licenses against the same beat hash for different wallets.
   - Ensures guard stays `false` for exclusivity.
5. **Exclusive guard enforcement** (`soundcloud_license.ts`):
   - Attempts to mint a second exclusive license while one is active (expects an `ExclusiveLicenseExists` error).
   - Revokes the original license and successfully mints the new exclusive.
6. **Program compilation check** (`test.ts`): Lightweight compile assurance.

All tests pass with `anchor test` (warnings about custom heap/panic configs are expected from Anchor tooling).

## Running Tests Manually
```bash
cd soundcloud_license
anchor test
```

Ensure no local `solana-test-validator` is running on port `9900` before executing.
