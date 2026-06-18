import { Routes } from '@angular/router';
import { authGuard } from './features/guards/auth.guard';
import { CategoryPageComponent } from './features/categories/category-page.component';
import { adminGuard } from './features/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'ShopSN — Boutique en ligne Sénégal'
  },
  {
    path: 'produits',
    loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: 'categorie/:slug',
    component: CategoryPageComponent
  },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reinitialisation-mot-de-passe',
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/user/pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'favoris',
    canActivate: [authGuard],
    loadComponent: () => import('./features/user/pages/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact | ShopSN'
  },
  {
    path: 'a-propos',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'A propos | ShopSN'
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable | ShopSN'
  }
];
