import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'connexion',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion | ShopSN'
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Inscription | ShopSN'
  },
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Mot de passe oublié | ShopSN'
  },
  {
    path: 'reinitialisation-mot-de-passe',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Réinitialisation | ShopSN'
  }
];
