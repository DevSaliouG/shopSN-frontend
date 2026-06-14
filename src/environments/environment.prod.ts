/**
 * Configuration de l'environnement de production
 * API HTTPS sécurisée, debug désactivé, optimisations activées
 */

export const environment = {
  production: true,
  
  // API Configuration
  apiUrl: 'https://api.shopsn.sn',
  apiTimeout: 20000, // 20 secondes
  
  // Application
  appName: 'ShopSN',
  appUrl: 'https://shopsn.sn',
  appVersion: '1.0.0',
  
  // WhatsApp
  whatsappNumber: '221700078822',
  
  // Stockage
  jwtTokenKey: 'shopSN_token',
  userStorageKey: 'shopSN_user',
  tokenExpiryKey: 'shopSN_token_expiry',
  
  // Feature flags
  enableAnalytics: true,
  enableDebug: false,
  enablePWA: true,
  
  // Limites
  maxUploadSize: 5242880, // 5MB
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Cache
  cacheTTL: 600, // 10 minutes en secondes
  
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
