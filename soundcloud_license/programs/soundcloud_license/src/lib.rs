use anchor_lang::prelude::*;

declare_id!("FYqcZuL5DUBUTTKx94oew8zZoX5rSR8WpEA3RJEXC457");

#[program]
pub mod soundcloud_license {
    use super::*;

    /// Initialize a new license
    pub fn initialize(
        ctx: Context<Initialize>,
        beat_hash: [u8; 32],
        terms_cid: String,
        license_type: LicenseType,
        territory: String,
        valid_until: i64,
    ) -> Result<()> {
        let license = &mut ctx.accounts.license;
        license.issuer = ctx.accounts.signer.key();
        license.beat_hash = beat_hash;
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
            license_type,
        });
        
        Ok(())
    }

    /// Revoke a license (only issuer can revoke)
    pub fn revoke(ctx: Context<RevokeLicense>) -> Result<()> {
        let license = &mut ctx.accounts.license;
        
        require!(
            license.issuer == ctx.accounts.signer.key(),
            LicenseError::UnauthorizedRevoker
        );
        
        require!(!license.revoked, LicenseError::AlreadyRevoked);
        
        license.revoked = true;
        
        emit!(LicenseRevoked {
            license: license.key(),
            revoked_by: ctx.accounts.signer.key(),
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(beat_hash: [u8; 32])]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + License::LEN,
        seeds = [b"license", beat_hash.as_ref()],
        bump
    )]
    pub license: Account<'info, License>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeLicense<'info> {
    #[account(mut)]
    pub license: Account<'info, License>,
    
    pub signer: Signer<'info>,
}

#[account]
pub struct License {
    pub issuer: Pubkey,           // 32 bytes
    pub beat_hash: [u8; 32],     // 32 bytes
    pub terms_cid: String,        // 4 bytes + string
    pub license_type: LicenseType, // 1 byte
    pub territory: String,        // 4 bytes + string
    pub valid_until: i64,        // 8 bytes
    pub revoked: bool,           // 1 byte
}

impl License {
    pub const LEN: usize = 32 + 32 + 4 + 200 + 1 + 4 + 50 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum LicenseType {
    Exclusive,
    NonExclusive,
}

#[error_code]
pub enum LicenseError {
    #[msg("Unauthorized to revoke this license")]
    UnauthorizedRevoker,
    #[msg("License already revoked")]
    AlreadyRevoked,
}

#[event]
pub struct LicenseInitialized {
    pub license: Pubkey,
    pub issuer: Pubkey,
    pub license_type: LicenseType,
}

#[event]
pub struct LicenseRevoked {
    pub license: Pubkey,
    pub revoked_by: Pubkey,
}
