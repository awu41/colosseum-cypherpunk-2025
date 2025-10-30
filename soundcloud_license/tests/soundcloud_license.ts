import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import type { SoundcloudLicense } from "../target/types/soundcloud_license";
import { expect } from "chai";

const LICENSE_ERROR_MESSAGES = {
  ExclusiveLicenseExists: "An exclusive license is already active for this beat",
};

const randomBeatHash = () =>
  anchor.web3.Keypair.generate().publicKey.toBytes().slice(0, 32);

function deriveLicensePda(beatHash: number[], licensee: anchor.web3.PublicKey, programId: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("license"), Buffer.from(beatHash), licensee.toBuffer()],
    programId
  );
}

function deriveGuardPda(beatHash: number[], programId: anchor.web3.PublicKey) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("license_guard"), Buffer.from(beatHash)],
    programId
  );
}

describe("soundcloud_license", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local("http://localhost:8899");
  anchor.setProvider(provider);

  const program = anchor.workspace.SoundcloudLicense as Program<SoundcloudLicense>;

  it("Initializes a license!", async () => {
    const issuer = anchor.getProvider().publicKey;
    const licensee = anchor.web3.Keypair.generate().publicKey;
    const beatMint = anchor.web3.Keypair.generate().publicKey;
    const beatHashBytes = anchor.web3.Keypair.generate().publicKey.toBytes().slice(0, 32);
    const termsCid = "QmTest123";
    const licenseType = { exclusive: {} };
    const territory = "Worldwide";
    const validUntil = new BN(Date.now() / 1000 + 86400); // 24 hours from now

    const [licensePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license"), Buffer.from(beatHashBytes), licensee.toBuffer()],
      program.programId
    );
    const [guardPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license_guard"), Buffer.from(beatHashBytes)],
      program.programId
    );

    const tx = await program.methods
      .initialize(
        Array.from(beatHashBytes),
        licensee,
        beatMint,
        termsCid,
        licenseType,
        territory,
        validUntil
      )
      .accounts({
        license: licensePda,
        guard: guardPda,
        signer: issuer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("License initialized! Transaction:", tx);

    // Fetch and verify the license account
    const licenseData = await program.account.license.fetch(licensePda);
    console.log("License data:", licenseData);
    
    // Verify fields
    expect(licenseData.issuer.toString()).to.equal(issuer.toString());
    expect(licenseData.licensee.toString()).to.equal(licensee.toString());
    expect(licenseData.beatMint.toString()).to.equal(beatMint.toString());
    expect(licenseData.termsCid).to.equal(termsCid);
    expect(licenseData.territory).to.equal(territory);
    expect(licenseData.revoked).to.equal(false);

    const guardData = await program.account.licenseGuard.fetch(guardPda);
    expect(guardData.exclusiveActive).to.equal(true);
  });

  it("Revokes a license!", async () => {
    const issuer = anchor.getProvider().publicKey;
    const licensee = anchor.web3.Keypair.generate().publicKey;
    const beatMint = anchor.web3.Keypair.generate().publicKey;
    const beatHashBytes = anchor.web3.Keypair.generate().publicKey.toBytes().slice(0, 32);
    const termsCid = "QmTest456";
    const licenseType = { nonExclusive: {} };
    const territory = "US";
    const validUntil = new BN(Date.now() / 1000 + 86400);

    const [licensePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license"), Buffer.from(beatHashBytes), licensee.toBuffer()],
      program.programId
    );
    const [guardPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license_guard"), Buffer.from(beatHashBytes)],
      program.programId
    );

    // First, initialize a license
    await program.methods
      .initialize(
        Array.from(beatHashBytes),
        licensee,
        beatMint,
        termsCid,
        licenseType,
        territory,
        validUntil
      )
      .accounts({
        license: licensePda,
        guard: guardPda,
        signer: issuer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("License initialized");

    // Now revoke it
    const revokeTx = await program.methods
      .revoke()
      .accounts({
        license: licensePda,
        guard: guardPda,
        signer: issuer,
      })
      .rpc();

    console.log("License revoked! Transaction:", revokeTx);

    // Fetch and verify the license is revoked
    const licenseData = await program.account.license.fetch(licensePda);
    expect(licenseData.revoked).to.equal(true);

    const guardData = await program.account.licenseGuard.fetch(guardPda);
    expect(guardData.exclusiveActive).to.equal(false);
  });

  it("allows multiple non-exclusive licenses for the same beat", async () => {
    const issuer = anchor.getProvider().publicKey;
    const beatHashBytes = randomBeatHash();
    const beatMint = anchor.web3.Keypair.generate().publicKey;
    const licenseType = { nonExclusive: {} };
    const territory = "Global";
    const validUntil = new BN(Date.now() / 1000 + 86400);
    const licensees = [
      anchor.web3.Keypair.generate().publicKey,
      anchor.web3.Keypair.generate().publicKey,
    ];

    for (const licensee of licensees) {
      const [licensePda] = deriveLicensePda(beatHashBytes, licensee, program.programId);
      const [guardPda] = deriveGuardPda(beatHashBytes, program.programId);

      await program.methods
        .initialize(
          Array.from(beatHashBytes),
          licensee,
          beatMint,
          `CID-${licensee.toBase58().slice(0, 6)}`,
          licenseType,
          territory,
          validUntil
        )
        .accounts({
          license: licensePda,
          guard: guardPda,
          signer: issuer,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const licenseData = await program.account.license.fetch(licensePda);
      expect(licenseData.licensee.toString()).to.equal(licensee.toString());
      expect(licenseData.licenseType).to.deep.equal(licenseType);

      const guardData = await program.account.licenseGuard.fetch(guardPda);
      expect(guardData.exclusiveActive).to.equal(false);
    }
  });

  it("blocks overlapping exclusives until revoked", async () => {
    const issuer = anchor.getProvider().publicKey;
    const beatHashBytes = randomBeatHash();
    const beatMint = anchor.web3.Keypair.generate().publicKey;
    const territory = "Exclusive Region";
    const validUntil = new BN(Date.now() / 1000 + 86400);

    const licenseeA = anchor.web3.Keypair.generate().publicKey;
    const licenseeB = anchor.web3.Keypair.generate().publicKey;

    const [licensePdaA] = deriveLicensePda(beatHashBytes, licenseeA, program.programId);
    const [licensePdaB] = deriveLicensePda(beatHashBytes, licenseeB, program.programId);
    const [guardPda] = deriveGuardPda(beatHashBytes, program.programId);

    // Initialize exclusive license for licensee A
    await program.methods
      .initialize(
        Array.from(beatHashBytes),
        licenseeA,
        beatMint,
        "EXCLUSIVE-CID-A",
        { exclusive: {} },
        territory,
        validUntil
      )
      .accounts({
        license: licensePdaA,
        guard: guardPda,
        signer: issuer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Second exclusive should fail
    let error: any = null;
    try {
      await program.methods
        .initialize(
          Array.from(beatHashBytes),
          licenseeB,
          beatMint,
          "EXCLUSIVE-CID-B",
          { exclusive: {} },
          territory,
          validUntil
        )
        .accounts({
          license: licensePdaB,
          guard: guardPda,
          signer: issuer,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.error.errorMessage).to.equal(
      LICENSE_ERROR_MESSAGES.ExclusiveLicenseExists
    );

    // Guard should reflect exclusive active
    const guardDataActive = await program.account.licenseGuard.fetch(guardPda);
    expect(guardDataActive.exclusiveActive).to.equal(true);

    // Revoke original exclusive
    await program.methods
      .revoke()
      .accounts({
        license: licensePdaA,
        guard: guardPda,
        signer: issuer,
      })
      .rpc();

    const guardDataAfterRevoke = await program.account.licenseGuard.fetch(guardPda);
    expect(guardDataAfterRevoke.exclusiveActive).to.equal(false);

    // Now licensee B should succeed
    await program.methods
      .initialize(
        Array.from(beatHashBytes),
        licenseeB,
        beatMint,
        "EXCLUSIVE-CID-B",
        { exclusive: {} },
        territory,
        validUntil
      )
      .accounts({
        license: licensePdaB,
        guard: guardPda,
        signer: issuer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const licenseBData = await program.account.license.fetch(licensePdaB);
    expect(licenseBData.revoked).to.equal(false);
    expect(licenseBData.licensee.toString()).to.equal(licenseeB.toString());

    const guardDataFinal = await program.account.licenseGuard.fetch(guardPda);
    expect(guardDataFinal.exclusiveActive).to.equal(true);
  });
});
