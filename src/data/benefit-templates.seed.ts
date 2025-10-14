/**
 * Seed script for benefit templates
 * Run this to populate the database with default benefit templates
 * 
 * To use: Import and call seedBenefitTemplates() from your seed admin page
 */

import { BenefitTemplate } from '../app/models/benefit-template';

export const DEFAULT_BENEFIT_TEMPLATES: Omit<BenefitTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ========== MINING HARDWARE BENEFITS ==========
  {
    name: 'Mining - Proven Performance',
    category: 'mining',
    icon: 'performance',
    iconColor: 'bitcoin-orange',
    title: 'Proven Performance',
    description: 'Industry-leading hash rates and efficiency for maximum profitability in your mining operations.',
    isActive: true,
    order: 1
  },
  {
    name: 'Mining - Energy Efficient',
    category: 'mining',
    icon: 'efficiency',
    iconColor: 'bitcoin-gold',
    title: 'Energy Efficient',
    description: 'Optimized power consumption reduces operational costs while maintaining peak performance.',
    isActive: true,
    order: 2
  },
  {
    name: 'Mining - Reliable & Durable',
    category: 'mining',
    icon: 'reliability',
    iconColor: 'green-500',
    title: 'Reliable & Durable',
    description: 'Built with premium components for long-term stability and minimal downtime in demanding environments.',
    isActive: true,
    order: 3
  },
  {
    name: 'Mining - Expert Support',
    category: 'mining',
    icon: 'support',
    iconColor: 'blue-500',
    title: 'Expert Support',
    description: 'Our team provides comprehensive setup assistance and ongoing technical support for optimal results.',
    isActive: true,
    order: 4
  },
  {
    name: 'Mining - Warranty Included',
    category: 'mining',
    icon: 'warranty',
    iconColor: 'purple-500',
    title: 'Warranty Included',
    description: 'Factory warranty coverage protects your investment and ensures peace of mind.',
    isActive: true,
    order: 5
  },
  {
    name: 'Mining - Best ROI',
    category: 'mining',
    icon: 'value',
    iconColor: 'yellow-500',
    title: 'Best ROI',
    description: 'Competitive pricing combined with superior efficiency delivers the best return on investment.',
    isActive: true,
    order: 6
  },

  // ========== ACCESSORY BENEFITS ==========
  {
    name: 'Accessory - Premium Quality',
    category: 'accessory',
    icon: 'quality',
    iconColor: 'bitcoin-orange',
    title: 'Premium Quality',
    description: 'Crafted from high-grade materials for exceptional durability and a luxurious feel.',
    isActive: true,
    order: 10
  },
  {
    name: 'Accessory - Unique Design',
    category: 'accessory',
    icon: 'design',
    iconColor: 'bitcoin-gold',
    title: 'Unique Design',
    description: 'Stand out with exclusive Bitcoin-themed designs that showcase your crypto passion.',
    isActive: true,
    order: 11
  },
  {
    name: 'Accessory - Great Value',
    category: 'accessory',
    icon: 'value',
    iconColor: 'green-500',
    title: 'Great Value',
    description: 'Premium quality at competitive prices makes this the perfect gift or personal accessory.',
    isActive: true,
    order: 12
  },
  {
    name: 'Accessory - Satisfaction Guaranteed',
    category: 'accessory',
    icon: 'warranty',
    iconColor: 'blue-500',
    title: 'Satisfaction Guaranteed',
    description: 'We stand behind our products with a satisfaction guarantee and responsive customer service.',
    isActive: true,
    order: 13
  },

  // ========== WALLET BENEFITS ==========
  {
    name: 'Wallet - Bank-Grade Security',
    category: 'wallet',
    icon: 'security',
    iconColor: 'bitcoin-orange',
    title: 'Bank-Grade Security',
    description: 'Military-grade encryption and certified secure elements protect your digital assets from all threats.',
    isActive: true,
    order: 20
  },
  {
    name: 'Wallet - Multi-Crypto Support',
    category: 'wallet',
    icon: 'quality',
    iconColor: 'bitcoin-gold',
    title: 'Multi-Crypto Support',
    description: 'Manage thousands of cryptocurrencies and tokens with a single device for ultimate convenience.',
    isActive: true,
    order: 21
  },
  {
    name: 'Wallet - Expert Guidance',
    category: 'wallet',
    icon: 'support',
    iconColor: 'green-500',
    title: 'Expert Guidance',
    description: 'Comprehensive setup assistance and 24/7 technical support for worry-free crypto management.',
    isActive: true,
    order: 22
  },
  {
    name: 'Wallet - Trusted Worldwide',
    category: 'wallet',
    icon: 'reliability',
    iconColor: 'blue-500',
    title: 'Trusted Worldwide',
    description: 'Join millions of users worldwide who trust this wallet for secure cryptocurrency storage.',
    isActive: true,
    order: 23
  },

  // ========== GENERAL BENEFITS (apply to all) ==========
  {
    name: 'General - Fast Shipping',
    category: 'general',
    icon: 'efficiency',
    iconColor: 'bitcoin-orange',
    title: 'Fast Worldwide Shipping',
    description: 'Quick and reliable delivery to your location with full tracking and insurance.',
    isActive: true,
    order: 100
  },
  {
    name: 'General - Secure Payment',
    category: 'general',
    icon: 'security',
    iconColor: 'green-500',
    title: 'Secure Payment',
    description: 'Multiple payment options including crypto payments for your convenience and security.',
    isActive: true,
    order: 101
  }
];
