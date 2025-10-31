import type { Listing } from "@/data/listings";

type LicenseApiResponse = {
  pda: string;
  account: {
    issuer: string;
    licensee: string;
    beatMint: string;
    beatHashHex: string;
    termsCid: string;
    licenseType: "Exclusive" | "NonExclusive";
    territory: string;
    validUntil: string;
    revoked: boolean;
  };
};

export async function fetchLicenseAccount(
  listing: Listing,
  licensee?: string
): Promise<LicenseApiResponse["account"] & { pda: string }>
{
  if (!listing.beatHashHex) {
    throw new Error("Listing missing beat hash");
  }

  const response = await fetch("/api/license-get", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ beatHashHex: listing.beatHashHex, licensee }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = (await response.json()) as LicenseApiResponse;
  return { pda: json.pda, ...json.account };
}

type ActiveResponse = {
  active: boolean;
  reason?: string;
};

export async function checkLicenseActive(
  listing: Listing,
  licensee?: string
): Promise<ActiveResponse>
{
  if (!listing.beatHashHex) {
    throw new Error("Listing missing beat hash");
  }

  const response = await fetch("/api/license/has-active", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ beatHashHex: listing.beatHashHex, licensee }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
