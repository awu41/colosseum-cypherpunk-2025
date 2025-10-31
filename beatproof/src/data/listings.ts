export type Listing = {
  id: string;
  title: string;
  artist: string;
  price: string;
  currency: string;
  vibes: string;
  soundcloudUrl: string;
  telegram?: string;
  status?: 'available' | 'licensed' | 'exclusive';
  termsCid?: string;
  beatHashHex?: string;
  beatMint?: string;
  licenseType?: 'Exclusive' | 'NonExclusive';
  territory?: string;
  validUntil?: string;
  notes?: string;
  contractSignature?: string;
  mock?: boolean;
};

export const listings: Listing[] = [
  {
    id: 'aurora-drift',
    title: 'Aurora Drift',
    artist: 'Lyra Nyx',
    price: '14.5',
    currency: 'SOL',
    vibes: 'ambient',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/1202021175',
    telegram: 'https://t.me/lyra_nyx',
    termsCid: 'ipfs://bafybeibvtlhdpsmueqaurora',
    beatHashHex: '3a5c1f4b2e9076d84f3761b35f2d208c7e9a0d4c3b8157b263e4a9f5c6d8e0a1',
    beatMint: '8h7YFJrL5DyY7n1bUDy1sX1tFoZT3zh7TBTtJU1vGj3B',
    licenseType: 'Exclusive',
    territory: 'Worldwide',
    validUntil: '1767225600',
  },
  {
    id: 'versus-waves',
    title: 'Versus Waves',
    artist: 'Binary Bloom',
    price: '9.2',
    currency: 'SOL',
    vibes: 'glitch soul',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/135310682',
    telegram: 'https://t.me/binarybloom',
    termsCid: 'ipfs://bafybeibinarywaves',
    beatHashHex: 'd2f17b4acd985e2f47a3b9c6f8e1a074d9cbb3a20f4761b2456ca89d73e0124f',
    beatMint: '5Z9mSvHX8bvNRDqNjNhBMmJZZK9wVwHvZtFRT5tZ342y',
    licenseType: 'NonExclusive',
    territory: 'Worldwide',
    validUntil: '1769913600',
  },
  {
    id: 'tidal-ritual',
    title: 'Tidal Ritual',
    artist: 'Oracle Tide',
    price: '18.0',
    currency: 'SOL',
    vibes: 'ritual bass',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/51069902',
    telegram: 'https://t.me/oracletide',
    termsCid: 'ipfs://bafybeitidalritual',
    beatHashHex: 'ac12ef45bd7890cdef3456ab12cd34ef56ab78cd90ef12ab34cd56ef78ab9012',
    beatMint: '9i1RnVwL3dV4i9XaEoXctQV9FTe74MkRUyvMh35vjpsk',
    licenseType: 'NonExclusive',
    territory: 'North America',
    validUntil: '1772505600',
  },
  {
    id: 'nebula-hums',
    title: 'Nebula Hums',
    artist: 'Helio Choir',
    price: '11.7',
    currency: 'SOL',
    vibes: 'astro choir',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/273961044',
    telegram: 'https://t.me/heliochoir',
    termsCid: 'ipfs://bafybeinebulahums',
    beatHashHex: '0f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f40312b4a5968778695a4b',
    beatMint: '6bD1eNT2h9jnYqUr45yT9dm42Hcps225y7sY9qsK4sRg',
    licenseType: 'Exclusive',
    territory: 'EU',
    validUntil: '1775097600',
  },
  {
    id: 'solar-echo',
    title: 'Solar Echo',
    artist: 'Nova Mira',
    price: '16.2',
    currency: 'SOL',
    vibes: 'ethereal trance',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/607012345',
    telegram: 'https://t.me/novamira',
    termsCid: 'ipfs://bafybeisolarecho',
    beatHashHex: 'f1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2918172635443f2e1d0',
    beatMint: '7Yf9h3mPj6D1vW4eL8ZcR2tNo1aBx5Vu7iWs3QxT9kLm',
    licenseType: 'NonExclusive',
    territory: 'Worldwide',
    validUntil: '1777689600',
  },
  {
    id: 'crimson-pulse',
    title: 'Crimson Pulse',
    artist: 'Vector Bloom',
    price: '8.4',
    currency: 'SOL',
    vibes: 'synthwave',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/402987654',
    telegram: 'https://t.me/vectorbloom',
    termsCid: 'ipfs://bafybeicrimsonpulse',
    beatHashHex: 'b5a4c3d2e1f0a9b8c7d6e5f40312b4a5968778695a4b3c2d1e0f9a8b7c6d5e4',
    beatMint: '4PxXj1FeUoZ9gK2Lb7qR8tVm5Ws6Yd8nGh2Kj5Lz9cEx',
    licenseType: 'NonExclusive',
    territory: 'Worldwide',
    validUntil: '1780281600',
  },
  {
    id: 'midnight-resin',
    title: 'Midnight Resin',
    artist: 'Haze District',
    price: '13.3',
    currency: 'SOL',
    vibes: 'lofi noir',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/872349012',
    telegram: 'https://t.me/hazedistrict',
    termsCid: 'ipfs://bafybeimidnightresin',
    beatHashHex: 'c4d3e2f1a0b9c8d7e6f5042312b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3',
    beatMint: '3sQh9YtRf7cV5bX8nK2Ld4gPz61HvDmC8JwR2eSo9uTb',
    licenseType: 'Exclusive',
    territory: 'Worldwide',
    validUntil: '1782873600',
  },
  {
    id: 'auric-flare',
    title: 'Auric Flare',
    artist: 'Golden Ratio',
    price: '21.0',
    currency: 'SOL',
    vibes: 'future bass',
    soundcloudUrl: 'https://api.soundcloud.com/tracks/998877665',
    telegram: 'https://t.me/goldenratio',
    termsCid: 'ipfs://bafybeiauricflare',
    beatHashHex: 'e3f2d1c0b9a8f7e6d5c4b3a2918172635443322110ffeedccbbbaa9988776655',
    beatMint: '2LfG8jD9sH3kV1bN5cT6yX7uQ4oPrM8nCg5Wh2Za7eYp',
    licenseType: 'Exclusive',
    territory: 'Worldwide',
    validUntil: '1785465600',
  },
  {
    id: 'demo-fast-pass',
    title: 'Demo Fast Pass',
    artist: 'Beatproof Labs',
    price: '0.0',
    currency: 'SOL',
    vibes: 'demo',
    soundcloudUrl: 'https://soundcloud.com',
    notes: 'Demo listing that instantly mints without touching the blockchain.',
    status: 'available',
    mock: true,
  },
];
