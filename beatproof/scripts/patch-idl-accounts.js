#!/usr/bin/env node
/**
 * Ensure the Anchor IDL includes account layouts for License and LicenseGuard.
 * Run this after `anchor build -- --features idl-build` and copying the IDL into beatproof/src/idl.
 */
const fs = require('fs');
const path = require('path');

const idlPath = path.resolve(__dirname, '../src/idl/soundcloud_license.json');

if (!fs.existsSync(idlPath)) {
  console.error(`IDL not found at ${idlPath}. Did you copy it from soundcloud_license/target/idl?`);
  process.exit(1);
}

const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

const layouts = {
  License: {
    kind: 'struct',
    fields: [
      { name: 'issuer', type: 'pubkey' },
      { name: 'licensee', type: 'pubkey' },
      { name: 'beat_mint', type: 'pubkey' },
      { name: 'beat_hash', type: { array: ['u8', 32] } },
      { name: 'terms_cid', type: 'string' },
      { name: 'license_type', type: { defined: { name: 'LicenseType' } } },
      { name: 'territory', type: 'string' },
      { name: 'valid_until', type: 'i64' },
      { name: 'revoked', type: 'bool' },
    ],
  },
  LicenseGuard: {
    kind: 'struct',
    fields: [
      { name: 'beat_hash', type: { array: ['u8', 32] } },
      { name: 'exclusive_active', type: 'bool' },
    ],
  },
};

idl.accounts = idl.accounts.map((account) => {
  const layout = layouts[account.name];
  if (!layout) return account;

  if (
    account.type &&
    JSON.stringify(account.type) === JSON.stringify(layout)
  ) {
    return account;
  }

  return { ...account, type: layout };
});

fs.writeFileSync(idlPath, JSON.stringify(idl, null, 2));
console.log(`Patched account layouts in ${idlPath}`);
