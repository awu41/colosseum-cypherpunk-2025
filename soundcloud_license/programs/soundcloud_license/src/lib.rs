use anchor_lang::prelude::*;

declare_id!("FYqcZuL5DUBUTTKx94oew8zZoX5rSR8WpEA3RJEXC457");

#[program]
pub mod soundcloud_license {
    use super::*;

    /// Initialize a new license
    pub fn initialize(
        ctx: Context<Initialize>,
        beat_hash: [u8; 32],
        licensee: Pubkey,
        beat_mint: Pubkey,
        terms_cid: String,
        license_type: LicenseType,
        territory: String,
        valid_until: i64,
    ) -> Result<()> {
        let license = &mut ctx.accounts.license;
        let guard = &mut ctx.accounts.guard;

        // Initialize guard on first use
        if guard.beat_hash == [0u8; 32] {
            guard.beat_hash = beat_hash;
        }

        require!(
            guard.beat_hash == beat_hash,
            LicenseError::GuardMismatch
        );

        if license_type == LicenseType::Exclusive {
            require!(
                !guard.exclusive_active,
                LicenseError::ExclusiveLicenseExists
            );
            guard.exclusive_active = true;
        }

        license.issuer = ctx.accounts.signer.key();
        license.licensee = licensee;
        license.beat_hash = beat_hash;
        license.beat_mint = beat_mint;
        license.terms_cid = terms_cid;
        license.license_type = license_type;
        license.territory = territory;
        license.valid_until = valid_until;
        license.revoked = false;
        // Note: bump is automatically handled by Anchor in the account constraints

        msg!("License initialized by: {:?}", license.issuer);
        emit!(LicenseInitialized {
            license: license.key(),
            issuer: license.issuer,
            licensee,
            license_type,
        });
        
        Ok(())
    }

    /// Revoke a license (only issuer can revoke)
    pub fn revoke(ctx: Context<RevokeLicense>) -> Result<()> {
        let license = &mut ctx.accounts.license;
        let guard = &mut ctx.accounts.guard;
        
        require!(
            license.issuer == ctx.accounts.signer.key(),
            LicenseError::UnauthorizedRevoker
        );
        
        require!(!license.revoked, LicenseError::AlreadyRevoked);
        
        license.revoked = true;
        if license.license_type == LicenseType::Exclusive {
            guard.exclusive_active = false;
        }
        
        emit!(LicenseRevoked {
            license: license.key(),
            revoked_by: ctx.accounts.signer.key(),
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(beat_hash: [u8; 32], licensee: Pubkey)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + License::LEN,
        seeds = [b"license", beat_hash.as_ref(), licensee.as_ref()],
        bump
    )]
    pub license: Account<'info, License>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + LicenseGuard::LEN,
        seeds = [b"license_guard", beat_hash.as_ref()],
        bump
    )]
    pub guard: Account<'info, LicenseGuard>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeLicense<'info> {
    #[account(mut)]
    pub license: Account<'info, License>,

    #[account(
        mut,
        seeds = [b"license_guard", license.beat_hash.as_ref()],
        bump
    )]
    pub guard: Account<'info, LicenseGuard>,
    
    pub signer: Signer<'info>,
}

#[account]
pub struct License {
    pub issuer: Pubkey,           // 32 bytes
    pub licensee: Pubkey,         // 32 bytes
    pub beat_mint: Pubkey,        // 32 bytes
    pub beat_hash: [u8; 32],     // 32 bytes
    pub terms_cid: String,        // 4 bytes + string
    pub license_type: LicenseType, // 1 byte
    pub territory: String,        // 4 bytes + string
    pub valid_until: i64,        // 8 bytes
    pub revoked: bool,           // 1 byte
}

impl License {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 4 + 200 + 1 + 4 + 50 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum LicenseType {
    Exclusive,
    NonExclusive,
}

#[account]
pub struct LicenseGuard {
    pub beat_hash: [u8; 32],
    pub exclusive_active: bool,
}

impl LicenseGuard {
    pub const LEN: usize = 32 + 1;
}

#[error_code]
pub enum LicenseError {
    #[msg("Unauthorized to revoke this license")]
    UnauthorizedRevoker,
    #[msg("License already revoked")]
    AlreadyRevoked,
    #[msg("An exclusive license is already active for this beat")]
    ExclusiveLicenseExists,
    #[msg("Exclusive guard mismatch for beat hash")]
    GuardMismatch,
}

#[event]
pub struct LicenseInitialized {
    pub license: Pubkey,
    pub issuer: Pubkey,
    pub licensee: Pubkey,
    pub license_type: LicenseType,
}

#[event]
pub struct LicenseRevoked {
    pub license: Pubkey,
    pub revoked_by: Pubkey,
}
