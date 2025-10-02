// Core data models for the creadevents application

export interface Service {
  id?: string;
  title: string;
  name?: string; // Admin dashboard compatibility
  slug: string;
  summary: string;
  description?: string;
  price?: string; // Admin dashboard compatibility
  inclusions: string[];
  features?: string[]; // Admin dashboard compatibility (alias for inclusions)
  minBudget: number;
  images: string[];
  imageUrl?: string; // Admin dashboard compatibility
  category?: string; // Admin dashboard compatibility
  active?: boolean; // Admin dashboard compatibility
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id?: string;
  title: string;
  slug: string;
  eventType: string;
  client?: string; // Admin dashboard compatibility
  season: Season[];
  palette: string[];
  location: string;
  date: Date;
  eventDate?: Date; // Admin dashboard compatibility (alias for date)
  heroImage: string;
  gallery: string[];
  imageUrls?: string[]; // Admin dashboard compatibility (alias for gallery)
  testimonialRef?: string;
  description?: string;
  floralsUsed?: string[];
  venue?: string;
  category?: string; // Admin dashboard compatibility
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Testimonial {
  id?: string;
  author: string;
  role?: string;
  event?: string;
  quote: string;
  photo?: string;
  rating?: number;
  featured?: boolean;
  createdAt?: Date;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  tags: string[];
  published?: boolean;
  featured?: boolean;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SeasonTheme {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  heroImage: string;
  heroVideo?: string;
  accentIllustrations?: string[];
  copySnippets: {
    hero: string;
    tagline: string;
    cta: string;
  };
}

export interface Settings {
  id?: string;
  themeBySeason: {
    spring: SeasonTheme;
    summer: SeasonTheme;
    autumn: SeasonTheme;
    winter: SeasonTheme;
  };
  contactEmail: string;
  socialLinks: {
    instagram?: string;
    whatsapp?: string;
    facebook?: string;
    email: string;
  };
  businessInfo: {
    name: string;
    address?: string;
    phone?: string;
    coverage: string[];
  };
  forceSeasonOverride?: Season;
  updatedAt?: Date;
}

export interface Inquiry {
  id?: string;
  // Contact fields
  fullName: string;
  email: string;
  phone: string;
  
  // Event fields
  eventDate: Date;
  isFlexible: boolean;
  venue: string;
  city: string;
  guestCount: number;
  budgetRange: string;
  
  // Style and preferences
  selectedStyles: string[];
  notes?: string;
  inspirationFiles?: string[];
  
  // System fields
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'completed' | 'cancelled';
  consentGiven: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Enums and types
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type EventType = 
  | 'wedding' 
  | 'corporate' 
  | 'private-party' 
  | 'installation' 
  | 'funeral' 
  | 'celebration-of-life'
  | 'other';

export type BudgetRange = 
  | 'under-500'
  | '500-1000'
  | '1000-2500'
  | '2500-5000'
  | '5000-10000'
  | 'over-10000';

export type ProjectStyle = 
  | 'minimalist'
  | 'bohemian'
  | 'classic-elegant'
  | 'rustic'
  | 'modern'
  | 'garden-party'
  | 'tropical'
  | 'vintage'
  | 'dramatic'
  | 'seasonal';