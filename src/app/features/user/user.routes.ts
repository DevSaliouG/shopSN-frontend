import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const USER_ROUTES: Routes = [
  {
    path: 'profil',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Mon profil | ShopSN'
  },
  {
    path: 'favoris',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [authGuard],
    title: 'Mes favoris | ShopSN'
  }
];