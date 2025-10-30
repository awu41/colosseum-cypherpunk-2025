export type Listing = {
  id: string;
  title: string;
  artist: string;
  price: string;
  currency: string;
  vibes: string;
  soundcloudUrl: string;
  telegram?: string;
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
  },
];
