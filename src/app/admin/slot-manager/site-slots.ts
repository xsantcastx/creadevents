import type { Section } from '../../services/cms.service';

export type PageKey =
  | 'home'
  | 'services'
  | 'portfolio'
  | 'about'
  | 'contact'
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
    { key: 'cta', label: 'Home CTA Banner', section: 'gallery', description: 'Wide banner below content' },
    { key: 'promo1', label: 'Promo 1', section: 'gallery', description: 'First promotional tile' },
    { key: 'promo2', label: 'Promo 2', section: 'gallery', description: 'Second promotional tile' },
    { key: 'promo3', label: 'Promo 3', section: 'gallery', description: 'Third promotional tile' },
  ],
  services: [
    { key: 'header', label: 'Services Header', section: 'hero', description: 'Hero image at top of Services' },
  ],
  portfolio: [
    { key: 'header', label: 'Portfolio Header', section: 'hero', description: 'Hero image at top of Portfolio' },
  ],
  about: [
    { key: 'header', label: 'About Header', section: 'hero', description: 'Hero image at top of About' },
    { key: 'team', label: 'Team Photo', section: 'about', description: 'Team or founder photo' },
    { key: 'studio', label: 'Studio Photo', section: 'about', description: 'Studio or atelier photo' },
  ],
  contact: [
    { key: 'header', label: 'Contact Header', section: 'hero', description: 'Hero image at top of Contact' },
  ],
  footer: [
    { key: 'logo', label: 'Footer Logo', section: 'footer', description: 'Brand mark in footer' },
  ],
};