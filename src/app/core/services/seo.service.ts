/**
 * Service de gestion du SEO (Search Engine Optimization)
 * Gère dynamiquement les meta tags, titres, et structured data
 *
 * Fonctionnalités:
 * - Meta tags standards (title, description, keywords)
 * - Open Graph pour Facebook/WhatsApp/LinkedIn
 * - Twitter Cards
 * - JSON-LD pour rich snippets (produits, organisation, breadcrumbs)
 * - Canonical URLs
 * - Robots directives
 */

import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Product, Category } from '../../features/models/product.model';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  robots?: 'index,follow' | 'noindex,nofollow' | 'index,nofollow' | 'noindex,follow';
  canonicalUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  // Configuration par défaut
  private readonly defaultConfig: SeoConfig = {
    title: 'ShopSN - Boutique en ligne Sénégal',
    description:
      'Découvrez des centaines de produits et commandez facilement via WhatsApp. Livraison au Sénégal.',
    keywords: 'e-commerce, Sénégal, boutique en ligne, WhatsApp, produits, shopping, Dakar',
    type: 'website',
    robots: 'index,follow',
  };

  // URL de base de l'application
  private readonly baseUrl = 'https://shopsn.sn';

  /**
   * Définit les meta tags SEO de base
   * @param config - Configuration SEO personnalisée
   */
  setBasicMeta(config: Partial<SeoConfig>): void {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Titre
    this.title.setTitle(finalConfig.title);

    // Meta tags standards
    this.meta.updateTag({ name: 'description', content: finalConfig.description });
    if (finalConfig.keywords) {
      this.meta.updateTag({ name: 'keywords', content: finalConfig.keywords });
    }
    if (finalConfig.robots) {
      this.meta.updateTag({ name: 'robots', content: finalConfig.robots });
    }
    if (finalConfig.author) {
      this.meta.updateTag({ name: 'author', content: finalConfig.author });
    }

    // Canonical URL
    const canonicalUrl = finalConfig.canonicalUrl || finalConfig.url || this.document.URL;
    this.setCanonicalUrl(canonicalUrl);
  }

  /**
   * Définit les meta tags Open Graph (Facebook, WhatsApp, LinkedIn)
   * @param config - Configuration SEO
   */
  setOpenGraphMeta(config: Partial<SeoConfig>): void {
    const url = config.url || this.document.URL;
    const image = config.image || `${this.baseUrl}/assets/images/og-image.jpg`;

    this.meta.updateTag({
      property: 'og:title',
      content: config.title || this.defaultConfig.title,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: config.description || this.defaultConfig.description,
    });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'ShopSN' });
    this.meta.updateTag({ property: 'og:locale', content: 'fr_FR' });

    // Image dimensions recommandées pour les réseaux sociaux
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: config.title || 'ShopSN' });
  }

  /**
   * Définit les meta tags Twitter Cards
   * @param config - Configuration SEO
   */
  setTwitterCard(config: Partial<SeoConfig>): void {
    const image = config.image || `${this.baseUrl}/assets/images/og-image.jpg`;

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:site', content: '@shopsn' });
    this.meta.updateTag({ name: 'twitter:creator', content: '@shopsn' });
    this.meta.updateTag({
      name: 'twitter:title',
      content: config.title || this.defaultConfig.title,
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description || this.defaultConfig.description,
    });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: config.title || 'ShopSN' });
  }

  /**
   * Définit l'URL canonique pour éviter le contenu dupliqué
   * @param url - URL canonique
   */
  setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Définit les meta tags pour un produit
   * @param product - Produit à optimiser SEO
   */
  setProductMeta(product: Product): void {
    const title = `${product.nom} - ${product.prix_format} | ShopSN`;
    const description = product.description_courte || product.description.substring(0, 160);
    const image = product.images?.find((img) => img.principale)?.url || product.images?.[0]?.url;
    const url = `${this.baseUrl}/produits/${product.slug}`;

    this.setBasicMeta({
      title,
      description,
      keywords: `${product.nom}, ${product.category?.nom}, achat en ligne, Sénégal, WhatsApp`,
      type: 'product',
      url,
    });

    this.setOpenGraphMeta({
      title,
      description,
      image,
      url,
      type: 'product',
    });

    this.setTwitterCard({
      title,
      description,
      image,
    });

    // Structured data JSON-LD pour produit
    this.setProductStructuredData(product);
  }

  /**
   * Définit les meta tags pour une catégorie
   * @param category - Catégorie à optimiser SEO
   */
  setCategoryMeta(category: Category): void {
    const title = `${category.nom} - Produits | ShopSN`;
    const description =
      category.description ||
      `Découvrez notre sélection de ${category.nom} de qualité sur ShopSN. Commandez facilement via WhatsApp.`;
    const url = `${this.baseUrl}/categorie/${category.slug}`;

    this.setBasicMeta({
      title,
      description,
      keywords: `${category.nom}, acheter ${category.nom}, ${category.nom} Sénégal, boutique en ligne`,
      type: 'website',
      url,
    });

    this.setOpenGraphMeta({
      title,
      description,
      url,
      type: 'website',
    });

    this.setTwitterCard({
      title,
      description,
    });
  }

  /**
   * Définit les meta tags pour la page d'accueil
   */
  setHomeMeta(): void {
    this.setBasicMeta({
      title: 'ShopSN - Boutique en ligne Sénégal | Achat via WhatsApp',
      description:
        'Découvrez des centaines de produits et commandez facilement via WhatsApp. Livraison rapide au Sénégal. Paiement sécurisé.',
      keywords: 'e-commerce, Sénégal, boutique en ligne, WhatsApp, achat en ligne, Dakar, produits',
    });

    this.setOpenGraphMeta({
      type: 'website',
    });

    this.setTwitterCard({});

    // Structured data pour l'organisation
    this.setOrganizationStructuredData();
  }

  /**
   * Définit les meta tags pour la recherche
   * @param query - Terme de recherche
   * @param resultsCount - Nombre de résultats
   */
  setSearchMeta(query: string, resultsCount: number): void {
    const title = `Résultats pour "${query}" - ${resultsCount} produit${resultsCount > 1 ? 's' : ''} | ShopSN`;
    const description = `Découvrez ${resultsCount} résultat${resultsCount > 1 ? 's' : ''} pour "${query}" sur ShopSN. Trouvez le produit qui vous correspond.`;

    this.setBasicMeta({
      title,
      description,
      keywords: `${query}, recherche, acheter ${query}, ${query} Sénégal`,
      robots: 'noindex,follow', // Les pages de recherche ne doivent pas être indexées
    });
  }

  /**
   * Structure de données JSON-LD pour un produit (Rich Snippets)
   * @param product - Produit
   */
  private setProductStructuredData(product: Product): void {
    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.nom,
      description: product.description_courte || product.description,
      image: product.images?.map((img) => img.url) || [],
      sku: `PROD-${product.id}`,
      mpn: `SN-${product.id}`,
      brand: {
        '@type': 'Brand',
        name: 'ShopSN',
      },
      offers: {
        '@type': 'Offer',
        price: product.prix,
        priceCurrency: 'XOF',
        availability:
          product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        url: `${this.baseUrl}/produits/${product.slug}`,
        seller: {
          '@type': 'Organization',
          name: 'ShopSN',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '128',
      },
      category: product.category?.nom,
    };

    this.setStructuredData('product', structuredData);
  }

  /**
   * Structure de données JSON-LD pour l'organisation (Organisation Schema)
   */
  private setOrganizationStructuredData(): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ShopSN',
      url: this.baseUrl,
      logo: `${this.baseUrl}/assets/images/logo.png`,
      sameAs: [
        'https://facebook.com/shopsn',
        'https://instagram.com/shopsn',
        'https://twitter.com/shopsn',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+221771234567',
        contactType: 'customer service',
        availableLanguage: ['French', 'Wolof'],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dakar',
        addressCountry: 'SN',
      },
    };

    this.setStructuredData('organization', structuredData);
  }

  /**
   * Structure de données JSON-LD pour le fil d'Ariane (BreadcrumbList Schema)
   * @param items - Liste des éléments du fil d'Ariane
   */
  setBreadcrumbStructuredData(items: { name: string; url: string }[]): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${this.baseUrl}${item.url}`,
      })),
    };

    this.setStructuredData('breadcrumb', structuredData);
  }

  /**
   * Injection générique de données structurées JSON-LD
   * @param key - Identifiant unique pour le script
   * @param data - Données structurées
   */
  private setStructuredData(key: string, data: any): void {
    let script = this.document.querySelector(`#structured-data-${key}`) as HTMLScriptElement;

    if (!script) {
      script = this.document.createElement('script');
      script.id = `structured-data-${key}`;
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }

  /**
   * Supprime toutes les données structurées (utile pour le nettoyage)
   */
  clearStructuredData(): void {
    const scripts = this.document.querySelectorAll('script[id^="structured-data-"]');
    scripts.forEach((script) => script.remove());
  }

  /**
   * Configuration SEO pour les erreurs 404
   */
  setNotFoundMeta(): void {
    this.setBasicMeta({
      title: 'Page non trouvée - 404 | ShopSN',
      description: "La page que vous recherchez n'existe pas ou a été déplacée.",
      robots: 'noindex,follow',
    });
  }

  /**
   * Ajoute les meta tags pour la validation des réseaux sociaux
   * @param platform - Plateforme (facebook, pinterest, etc.)
   * @param code - Code de validation
   */
  addVerificationTag(platform: 'facebook' | 'pinterest' | 'google', code: string): void {
    const metaMap = {
      facebook: 'fb:app_id',
      pinterest: 'p:domain_verify',
      google: 'google-site-verification',
    };

    this.meta.updateTag({ name: metaMap[platform], content: code });
  }
}
