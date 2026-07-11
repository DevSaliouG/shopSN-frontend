/**
 * Configuration de l'environnement de production
 * API HTTPS sécurisée, debug désactivé, optimisations activées
 */

export const environment = {
  production: true,

  apiUrl: 'https://api.onlinestore.sn',
  apiTimeout: 20000,
  assetsUrl: 'https://onlinestore.sn/assets',
  imagePlaceholders: {
    hero: '/assets/images/hero-bg.jpg',
    placeholder: '/assets/images/placeholder.webp',
    avatar: '/assets/images/avatars/avatar-1.webp',
  },

  appName: 'OnlineStore',
  appUrl: 'https://onlinestore.sn',
  appVersion: '1.0.0',

  whatsappNumber: '221787838002',

  jwtTokenKey: 'onlineStore_token',
  userStorageKey: 'onlineStore_user',
  tokenExpiryKey: 'onlineStore_token_expiry',

  enableAnalytics: true,
  enableDebug: false,
  enablePWA: true,

  maxUploadSize: 5242880,
  defaultPageSize: 20,
  maxPageSize: 100,

  cacheTTL: 600,

  defaultMetaTitle: 'OnlineStore - Boutique en ligne Sénégal',
  defaultMetaDescription: 'Découvrez des centaines de produits et commandez facilement via WhatsApp. Livraison au Sénégal.',
  defaultMetaKeywords: 'e-commerce, Sénégal, boutique en ligne, WhatsApp, produits',

  socialLinks: {
    facebook: 'https://facebook.com/onlinestore',
    instagram: 'https://instagram.com/onlinestore',
    twitter: 'https://twitter.com/onlinestore',
  },
};
