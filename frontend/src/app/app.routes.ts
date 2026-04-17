import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  { path: 'category/:slug', loadComponent: () => import('./features/category/category-page.component').then((m) => m.CategoryPageComponent) },
  { path: 'product/:slug', loadComponent: () => import('./features/product/product-detail.component').then((m) => m.ProductDetailComponent) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart-page.component').then((m) => m.CartPageComponent) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent) },
  { path: 'track-order', loadComponent: () => import('./features/track/track-order.component').then((m) => m.TrackOrderComponent) },
  { path: 'admin/login', loadComponent: () => import('./features/admin/admin-login.component').then((m) => m.AdminLoginComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/admin-categories.component').then((m) => m.AdminCategoriesComponent) },
      { path: 'categories/new', loadComponent: () => import('./features/admin/admin-category-form.component').then((m) => m.AdminCategoryFormComponent) },
      { path: 'categories/:id', loadComponent: () => import('./features/admin/admin-category-form.component').then((m) => m.AdminCategoryFormComponent) },
      { path: 'products', loadComponent: () => import('./features/admin/admin-products.component').then((m) => m.AdminProductsComponent) },
      { path: 'products/new', loadComponent: () => import('./features/admin/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
      { path: 'products/:id', loadComponent: () => import('./features/admin/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
      { path: 'banners', loadComponent: () => import('./features/admin/admin-banners.component').then((m) => m.AdminBannersComponent) },
      { path: 'banners/new', loadComponent: () => import('./features/admin/admin-banner-form.component').then((m) => m.AdminBannerFormComponent) },
      { path: 'banners/:id', loadComponent: () => import('./features/admin/admin-banner-form.component').then((m) => m.AdminBannerFormComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
