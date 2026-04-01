import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  { path: 'category/:slug', loadComponent: () => import('./features/category/category-page.component').then((m) => m.CategoryPageComponent) },
  { path: 'product/:slug', loadComponent: () => import('./features/product/product-detail.component').then((m) => m.ProductDetailComponent) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart-page.component').then((m) => m.CartPageComponent) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent) },
  { path: 'track-order', loadComponent: () => import('./features/track/track-order.component').then((m) => m.TrackOrderComponent) },
  { path: '**', redirectTo: '' },
];
