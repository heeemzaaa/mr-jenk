import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { Register } from './features/auth/components/register/register';
import { Profile } from './features/profile/profile_component/profile';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';
import { sellerGuard } from './core/guards/seller.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/products/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'system-design',
    loadComponent: () =>
      import('./features/system-design/system-design').then((m) => m.SystemDesign),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'dashboard',
    canActivate: [sellerGuard],
    loadComponent: () =>
      import('./features/seller-dashboard/seller-dashboard').then((m) => m.SellerDashboard),
  },

  {
    path: 'login',
    canActivate: [guestGuard],
    component: Login,
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    component: Register,
  },
  {
    path: 'profile',
    canActivate: [sellerGuard],
    component: Profile,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
