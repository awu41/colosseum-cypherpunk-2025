import ListingCard from './ListingCard.jsx';

const MarketplaceGrid = ({ listings, onBuy, onContact }) => (
  <section className="marketplace-grid" id="marketplace">
    {listings.map((listing) => (
      <ListingCard key={listing.id} listing={listing} onBuy={onBuy} onContact={onContact} />
    ))}
  </section>
);

export default MarketplaceGrid;
