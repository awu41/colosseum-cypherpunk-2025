'use client';

import ListingCard from './ListingCard';
import { Listing } from '@/data/listings';

type Props = {
  listings: Listing[];
  onBuy: (listing: Listing) => void;
  onContact: (listing: Listing) => void;
  onViewLicense: (listing: Listing) => void;
  buyingId?: string | null;
};

export default function MarketplaceGrid({ listings, onBuy, onContact, onViewLicense, buyingId }: Props) {
  return (
    <section className="marketplace-grid" id="marketplace">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onBuy={onBuy}
          onContact={onContact}
          onViewLicense={onViewLicense}
          isProcessing={buyingId === listing.id}
        />
      ))}
    </section>
  );
}
