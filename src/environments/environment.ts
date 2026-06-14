/**
 * Configuration de l'environnement de développement
 * API locale Laravel (port 8000 par défaut)
 * Debug activé, logs verbose
 */

export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:8000',
  apiTimeout: 30000, // 30 secondes
  
  // Application
  appName: 'ShopSN',
  appUrl: 'http://localhost:4200',
  appVersion: '1.0.0-dev',
  
  // WhatsApp
  whatsappNumber: '222170078822',
  
  // Stockage
  jwtTokenKey: 'shopSN_token',
  userStorageKey: 'shopSN_user',
  tokenExpiryKey: 'shopSN_token_expiry',
  
  // Feature flags
  enableAnalytics: false,
  enableDebug: true,
  enablePWA: false,
  
  // Limites
  maxUploadSize: 5242880, // 5MB
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Cache
  cacheTTL: 300, // 5 minutes en secondes
  
  // SEO
  defaultMetaTitle: 'ShopSN - Boutique en ligne Sénégal',
  defaultMetaDescription: 'Découvrez des centaines de produits et commandez facilement via WhatsApp. Livraison au Sénégal.',
  defaultMetaKeywords: 'e-commerce, Sénégal, boutique en ligne, WhatsApp, produits',
  
  // Social
  socialLinks: {
    facebook: 'https://facebook.com/shopsn',
    instagram: 'https://instagram.com/shopsn',
    twitter: 'https://twitter.com/shopsn'
  }
};
