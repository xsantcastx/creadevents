/**
 * Benefit Template Model
 * Represents a reusable benefit template that can be applied to products
 */
export interface BenefitTemplate {
  id?: string;
  
  // Template Info
  name: string;              // Template name (for admin reference)
  category: string;          // Product category slug (matches Category.slug from database)
  
  // Benefit Data (what gets added to products)
  icon: 'performance' | 'efficiency' | 'reliability' | 'support' | 'quality' | 'security' | 'warranty' | 'design' | 'value';
  iconColor: string;         // e.g., 'bitcoin-orange', 'bitcoin-gold', 'green-500'
  title: string;             // Benefit title (displayed on product page)
  description: string;       // Benefit description (displayed on product page)
  
  // Meta
  isActive: boolean;         // Show in product admin?
  order: number;             // Display order in template picker
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Icon type options for templates
 */
export const BENEFIT_ICON_TYPES = [
  'performance',
  'efficiency',
  'reliability',
  'support',
  'quality',
  'security',
  'warranty',
  'design',
  'value'
] as const;

/**
 * Color options for icons
 */
export const BENEFIT_ICON_COLORS = [
  { value: 'bitcoin-orange', label: 'Bitcoin Orange', preview: '#F7931A' },
  { value: 'bitcoin-gold', label: 'Bitcoin Gold', preview: '#FFB800' },
  { value: 'green-500', label: 'Green', preview: '#22c55e' },
  { value: 'blue-500', label: 'Blue', preview: '#3b82f6' },
  { value: 'purple-500', label: 'Purple', preview: '#a855f7' },
  { value: 'yellow-500', label: 'Yellow', preview: '#eab308' },
  { value: 'red-500', label: 'Red', preview: '#ef4444' },
  { value: 'cyan-500', label: 'Cyan', preview: '#06b6d4' },
  { value: 'pink-500', label: 'Pink', preview: '#ec4899' },
] as const;
