'use client';

import ListingCard from './ListingCard';
import { Listing } from '@/data/listings';

export default function MarketplaceGrid({ listings, onBuy, onContact }: { listings: Listing[]; onBuy: (listing: Listing) => void; onContact: (listing: Listing) => void }) {
  return (
    <section className="marketplace-grid" id="marketplace">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} onBuy={onBuy} onContact={onContact} />
      ))}
    </section>
  );
}
