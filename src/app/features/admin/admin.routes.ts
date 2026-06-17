import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';
import { adminGuard } from '../guards/admin.guard';
import { AdminLayoutComponent } from './admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivateChild: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'produits',
        loadComponent: () =>
          import('./pages/products-management/products-management.component').then(
            (m) => m.ProductsManagementComponent,
          ),
      },
      {
        path: 'produits/supprimes',
        loadComponent: () => import('./pages/products-management/products-management.component').then(m => m.ProductsManagementComponent),
        data: { showTrashed: true }
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories-management/categories-management.component').then(
            (m) => m.CategoriesManagementComponent,
          ),
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./pages/users-management/users-management.component').then(
            (m) => m.UsersManagementComponent,
          ),
      },
    ],
  },
];
