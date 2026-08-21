#!/usr/bin/env node
/**
 * Générateur de sitemap.xml automatique
 * Interroge l'API Laravel pour obtenir tous les produits et catégories
 * Génère sitemap.xml + image-sitemap.xml
 *
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://dkronlinestore.sn',
  apiUrl: process.env.API_URL || 'http://localhost:8000',
  outputDir: path.join(__dirname, '../src'),
  distDir: path.join(__dirname, '../dist/shopSN-frontend/browser'),
};

// Pages statiques
const STATIC_PAGES = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/produits', priority: 0.9, changefreq: 'daily' },
  { url: '/a-propos', priority: 0.5, changefreq: 'monthly' },
  { url: '/contact', priority: 0.6, changefreq: 'monthly' },
];

/**
 * Fetch avec timeout
 */
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Récupère tous les produits depuis l'API
 */
async function fetchProducts() {
  try {
    console.log('📦 Récupération des produits...');
    const response = await fetchWithTimeout(`${CONFIG.apiUrl}/api/products?per_page=1000`);

    if (!response.ok) {
      console.warn(`⚠️  API products retourné ${response.status}`);
      return [];
    }

    const data = await response.json();
    const products = data.data || [];
    console.log(`✓ ${products.length} produits récupérés`);
    return products;
  } catch (error) {
    console.warn('⚠️  Erreur lors de la récupération des produits:', error.message);
    return [];
  }
}

/**
 * Récupère toutes les catégories depuis l'API
 */
async function fetchCategories() {
  try {
    console.log('📁 Récupération des catégories...');
    const response = await fetchWithTimeout(`${CONFIG.apiUrl}/api/categories`);

    if (!response.ok) {
      console.warn(`⚠️  API categories retourné ${response.status}`);
      return [];
    }

    const data = await response.json();
    const categories = data.data || [];
    console.log(`✓ ${categories.length} catégories récupérées`);
    return categories;
  } catch (error) {
    console.warn('⚠️  Erreur lors de la récupération des catégories:', error.message);
    return [];
  }
}

/**
 * Génère le sitemap.xml
 */
function generateSitemap(products, categories) {
  console.log('🗺️  Génération du sitemap.xml...');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Pages statiques
  STATIC_PAGES.forEach(page => {
    xml += `
  <url>
    <loc>${CONFIG.baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // Catégories
  categories.forEach(category => {
    xml += `
  <url>
    <loc>${CONFIG.baseUrl}/categorie/${category.slug}</loc>
    <lastmod>${new Date(category.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Produits
  products.forEach(product => {
    xml += `
  <url>
    <loc>${CONFIG.baseUrl}/produits/${product.slug}</loc>
    <lastmod>${new Date(product.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;

    // Ajouter les images du produit
    if (product.images && product.images.length > 0) {
      product.images.slice(0, 3).forEach(image => {
        if (image.url) {
          xml += `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${escapeXml(product.nom)}</image:title>
      <image:caption>${escapeXml(product.description_courte || product.nom)}</image:caption>
    </image:image>`;
        }
      });
    }

    xml += `
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
}

/**
 * Génère le image-sitemap.xml
 */
function generateImageSitemap(products) {
  console.log('🖼️  Génération du image-sitemap.xml...');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  products.forEach(product => {
    if (!product.images || product.images.length === 0) return;

    xml += `
  <url>
    <loc>${CONFIG.baseUrl}/produits/${product.slug}</loc>`;

    product.images.forEach(image => {
      if (image.url) {
        xml += `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${escapeXml(product.nom)}</image:title>
      <image:caption>${escapeXml(product.description_courte || product.nom)}</image:caption>
    </image:image>`;
      }
    });

    xml += `
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
}

/**
 * Échappe les caractères XML
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Écrit un fichier dans src/ et dist/
 */
function writeFile(filename, content) {
  const srcPath = path.join(CONFIG.outputDir, filename);
  const distPath = path.join(CONFIG.distDir, filename);

  // Écrire dans src/
  fs.writeFileSync(srcPath, content, 'utf8');
  console.log(`✓ ${filename} créé dans src/`);

  // Écrire dans dist/ si le dossier existe
  if (fs.existsSync(CONFIG.distDir)) {
    fs.writeFileSync(distPath, content, 'utf8');
    console.log(`✓ ${filename} créé dans dist/browser/`);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Génération des sitemaps DkrOnlineStore\n');

  try {
    // Récupérer les données
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);

    // Générer les sitemaps
    const sitemap = generateSitemap(products, categories);
    const imageSitemap = generateImageSitemap(products);

    // Écrire les fichiers
    writeFile('sitemap.xml', sitemap);
    writeFile('image-sitemap.xml', imageSitemap);

    console.log('\n✅ Sitemaps générés avec succès!');
    console.log(`📊 Statistiques:`);
    console.log(`   - Pages statiques: ${STATIC_PAGES.length}`);
    console.log(`   - Catégories: ${categories.length}`);
    console.log(`   - Produits: ${products.length}`);
    console.log(`   - Total URLs: ${STATIC_PAGES.length + categories.length + products.length}`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    process.exit(1);
  }
}

// Exécuter
main();
