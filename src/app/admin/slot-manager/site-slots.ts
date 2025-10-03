import type { Section } from '../../services/cms.service';

export type PageKey =
  | 'home'
  | 'services'
  | 'portfolio'
  | 'seasonal'
  | 'client-stories'
  | 'about'
  | 'journal'
  | 'footer';

export interface SlotDef {
  key: string;            // position key (combined with page => full slot key "page.key")
  label: string;          // human-friendly label for admins
  section: Section;       // which image section to suggest (hero/gallery/…)
  description?: string;   // where it appears
  preview?: string;       // optional wireframe image path: assets/admin/wireframes/<page>.png
}

export const SITE_SLOTS: Record<PageKey, SlotDef[]> = {
  home: [
    { key: 'header', label: 'Home Header (Hero)', section: 'hero', description: 'Hero image at top of Home' },
    { key: 'cta', label: 'Home CTA Banner', section: 'gallery', description: 'Wide banner below hero' },
    { key: 'promo1', label: 'Promo 1', section: 'gallery' },
    { key: 'promo2', label: 'Promo 2', section: 'gallery' },
    { key: 'promo3', label: 'Promo 3', section: 'gallery' },
  ],
  services: [
    { key: 'header', label: 'Services Header', section: 'hero' },
    { key: 'banner', label: 'Services Banner', section: 'gallery' },
  ],
  portfolio: [
    { key: 'header', label: 'Portfolio Header', section: 'hero' },
  ],
  seasonal: [
    { key: 'header', label: 'Seasonal Looks Header', section: 'hero' },
  ],
  'client-stories': [
    { key: 'header', label: 'Client Stories Header', section: 'hero' },
  ],
  about: [
    { key: 'header', label: 'About Header', section: 'hero' },
  ],
  journal: [
    { key: 'header', label: 'Journal Header', section: 'hero' },
  ],
  footer: [
    { key: 'logo', label: 'Footer Logo', section: 'footer', description: 'Brand mark in footer' },
    { key: 'background', label: 'Footer Background', section: 'gallery' },
  ],
};