import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ✅ Pages publiques SEO-critiques → SSR dynamique
  {
    path: 'produits/:slug',
    renderMode: RenderMode.Server  // Product details need dynamic SEO meta tags
  },
  {
    path: 'categorie/:slug',
    renderMode: RenderMode.Server  // Category pages need dynamic SEO meta tags
  },
  {
    path: 'produits',
    renderMode: RenderMode.Server  // Product catalog needs SEO indexing
  },

  // ✅ Pages authentifiées → Client-Side Rendering (pas besoin SEO)
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'profil',
    renderMode: RenderMode.Client
  },
  {
    path: 'favoris',
    renderMode: RenderMode.Client
  },
  {
    path: 'connexion',
    renderMode: RenderMode.Client
  },
  {
    path: 'inscription',
    renderMode: RenderMode.Client
  },

  // ✅ Pages statiques → Prerender (généré au build)
  {
    path: '**',
    renderMode: RenderMode.Prerender  // Home, About, Contact
  }
];
