export interface SoloMinerCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  hashrate?: string;
  power?: string;
  efficiency?: string;
  price?: number | null;
  features: string[];
  badge?: string;
  ctaLabel: string;
  ctaLink: string;
  inStock?: boolean;
}

export const SOLO_MINER_CATEGORY_SLUG = 'solo-miners';

export const SOLO_MINER_FALLBACK_PRODUCTS: SoloMinerCard[] = [
  {
    id: 'bitaxe-ultra',
    name: 'Bitaxe Ultra',
    slug: 'bitaxe-ultra-solo-miner',
    description: 'soloMiners.fallback.bitaxe.description',
    imageUrl: '/assets/products/solo-miners/bitaxe-ultra.jpg',
    hashrate: '500 GH/s',
    power: '15 W',
    efficiency: '30 J/TH',
    price: 299,
    features: [
      'soloMiners.fallback.bitaxe.features.usb',
      'soloMiners.fallback.bitaxe.features.silent',
      'soloMiners.fallback.bitaxe.features.openSource',
      'soloMiners.fallback.bitaxe.features.easySetup'
    ],
    ctaLabel: 'soloMiners.cta.requestQuote',
    ctaLink: '/contacto?product=bitaxe-ultra',
    badge: 'soloMiners.badges.hobby',
    inStock: true
  },
  {
    id: 'apollo-btc',
    name: 'Apollo BTC',
    slug: 'apollo-btc-solo-miner',
    description: 'soloMiners.fallback.apollo.description',
    imageUrl: '/assets/products/solo-miners/apollo-btc.jpg',
    hashrate: '2.8 TH/s',
    power: '200 W',
    efficiency: '71 J/TH',
    price: 799,
    features: [
      'soloMiners.fallback.apollo.features.node',
      'soloMiners.fallback.apollo.features.lowNoise',
      'soloMiners.fallback.apollo.features.desktop',
      'soloMiners.fallback.apollo.features.premium'
    ],
    ctaLabel: 'soloMiners.cta.requestQuote',
    ctaLink: '/contacto?product=apollo-btc',
    badge: 'soloMiners.badges.pro',
    inStock: true
  },
  {
    id: 'compac-f',
    name: 'Compac F USB Miner',
    slug: 'compac-f-usb-solo-miner',
    description: 'soloMiners.fallback.compac.description',
    imageUrl: '/assets/products/solo-miners/compac-f.jpg',
    hashrate: '300 GH/s',
    power: '10 W',
    efficiency: '33 J/TH',
    price: 199,
    features: [
      'soloMiners.fallback.compac.features.usb',
      'soloMiners.fallback.compac.features.lowPower',
      'soloMiners.fallback.compac.features.affordable',
      'soloMiners.fallback.compac.features.plugPlay'
    ],
    ctaLabel: 'soloMiners.cta.requestQuote',
    ctaLink: '/contacto?product=compac-f',
    badge: 'soloMiners.badges.entry',
    inStock: true
  }
];
