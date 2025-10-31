import type { Listing } from '@/data/listings';

const STORAGE_KEY = 'beatproof-custom-listings';

function isListing(value: any): value is Listing {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.artist === 'string' &&
    typeof value.soundcloudUrl === 'string'
  );
}

export function loadCustomListings(): Listing[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isListing);
  } catch {
    return [];
  }
}

function saveCustomListings(listings: Listing[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch {
    // ignore storage failures
  }
}

export function addCustomListing(listing: Listing) {
  const listings = loadCustomListings();
  const filtered = listings.filter((item) => item.id !== listing.id);
  filtered.unshift(listing);
  saveCustomListings(filtered);
}

export function clearCustomListings() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
