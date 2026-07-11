import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'produits/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'categorie/:slug',
    renderMode: RenderMode.Client
  },
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
    path: 'produits',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
