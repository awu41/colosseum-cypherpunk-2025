import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import type { SoundcloudLicense } from "../target/types/soundcloud_license";
import { expect } from "chai";

describe("soundcloud_license", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local("http://localhost:8899");
  anchor.setProvider(provider);

  const program = anchor.workspace.SoundcloudLicense as Program<SoundcloudLicense>;

  it("Initializes a license!", async () => {
    const issuer = anchor.getProvider().publicKey;
    const beatHash = anchor.web3.Keypair.generate().publicKey.toBytes().slice(0, 32);
    const termsCid = "QmTest123";
    const licenseType = { exclusive: {} };
    const territory = "Worldwide";
    const validUntil = new BN(Date.now() / 1000 + 86400); // 24 hours from now

    const [licensePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license"), Buffer.from(beatHash)],
      program.programId
    );

    const tx = await program.methods
      .initialize(
        Array.from(beatHash),
        termsCid,
        licenseType,
        territory,
        validUntil
      )
      .accounts({
        license: licensePda,
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
    expect(licenseData.termsCid).to.equal(termsCid);
    expect(licenseData.territory).to.equal(territory);
    expect(licenseData.revoked).to.equal(false);
  });

  it("Revokes a license!", async () => {
    const issuer = anchor.getProvider().publicKey;
    const beatHash = anchor.web3.Keypair.generate().publicKey.toBytes().slice(0, 32);
    const termsCid = "QmTest456";
    const licenseType = { nonExclusive: {} };
    const territory = "US";
    const validUntil = new BN(Date.now() / 1000 + 86400);

    const [licensePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("license"), Buffer.from(beatHash)],
      program.programId
    );

    // First, initialize a license
    await program.methods
      .initialize(
        Array.from(beatHash),
        termsCid,
        licenseType,
        territory,
        validUntil
      )
      .accounts({
        license: licensePda,
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
        signer: issuer,
      })
      .rpc();

    console.log("License revoked! Transaction:", revokeTx);

    // Fetch and verify the license is revoked
    const licenseData = await program.account.license.fetch(licensePda);
    expect(licenseData.revoked).to.equal(true);
  });
});
