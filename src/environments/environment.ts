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
  assetsUrl: 'http://localhost:4200/assets',
  imagePlaceholders: {
    hero: 'https://picsum.photos/id/20/800/600',
    placeholder: 'https://picsum.photos/400/400',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  
  // Application
  appName: 'OnlineStore',
  appUrl: 'http://localhost:4200',
  appVersion: '1.0.0-dev',
  
  // WhatsApp
  whatsappNumber: '222170078822',
  
  // Stockage
  jwtTokenKey: 'onlineStore_token',
  userStorageKey: 'onlineStore_user',
  tokenExpiryKey: 'onlineStore_token_expiry',
  
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
  defaultMetaTitle: 'OnlineStore - Boutique en ligne Sénégal',
  defaultMetaDescription: 'Découvrez des centaines de produits et commandez facilement via WhatsApp. Livraison au Sénégal.',
  defaultMetaKeywords: 'e-commerce, Sénégal, boutique en ligne, WhatsApp, produits',
  
  // Social
  socialLinks: {
    facebook: 'https://facebook.com/onlinestore',
    instagram: 'https://instagram.com/onlinestore',
    twitter: 'https://twitter.com/onlinestore'
  }
};
