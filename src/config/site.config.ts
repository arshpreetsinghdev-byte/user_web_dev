export const siteConfig = {
  name: 'Book Ride',
  description: 'Book your ride in seconds - Fast, reliable, and affordable taxi service',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',

  // Branding
  branding: {
    logo: '/logo.svg',
    logoDark: '/logo-dark.svg',
    favicon: '/favicon.ico',
  },

  // Theme Colors (can be changed per client)
  colors: {
    primary: '#3B82F6', // Blue
    secondary: '#10B981', // Green
    accent: '#F59E0B', // Amber
  },

  // Features
  features: {
    wallet: true,
    coupons: true,
    multiLanguage: true,
    realTimeTracking: true,
    scheduleRides: true,
  },

  // Contact
  contact: {
    email: 'support@taxibook.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
  },

  // Social Links
  social: {
    facebook: 'https://facebook.com/taxibook',
    twitter: 'https://twitter.com/taxibook',
    instagram: 'https://instagram.com/taxibook',
    linkedin: 'https://linkedin.com/company/taxibook',
  },

  // SEO
  seo: {
    keywords: ['taxi', 'ride booking', 'cab service', 'transportation', 'ride hailing'],
    author: 'TaxiBook',
  },
} as const;

export type SiteConfig = typeof siteConfig;
