import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { timer, switchMap, catchError, of, map, startWith, shareReplay } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { AdminOrderService } from '../../core/services/admin-order.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="ij-admin min-h-screen bg-app-bg text-app-ink flex flex-col">
      <header class="border-b border-app-border bg-app-card/90 backdrop-blur-sm sticky top-0 z-10">
        <div class="ij-page py-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-6 flex-wrap">
            <a routerLink="/admin/dashboard" class="font-display text-xl text-app-ink hover:text-app-accent transition-colors">Admin</a>
            <nav class="flex items-center gap-1 text-sm">
              <a
                routerLink="/admin/dashboard"
                routerLinkActive="text-app-accent font-medium"
                [routerLinkActiveOptions]="{ exact: true }"
                class="px-3 py-2 rounded-lg hover:bg-app-field text-app-ink transition-colors"
                >Dashboard</a
              >
              <a
                routerLink="/admin/categories"
                routerLinkActive="text-app-accent font-medium"
                class="px-3 py-2 rounded-lg hover:bg-app-field text-app-ink transition-colors"
                >Categories</a
              >
              <a
                routerLink="/admin/products"
                routerLinkActive="text-app-accent font-medium"
                class="px-3 py-2 rounded-lg hover:bg-app-field text-app-ink transition-colors"
                >Products</a
              >
              <a
                routerLink="/admin/orders"
                routerLinkActive="text-app-accent font-medium"
                class="px-3 py-2 rounded-lg hover:bg-app-field text-app-ink transition-colors inline-flex items-center gap-2"
              >
                <span>Orders</span>
                @if (hasIncompleteOrders$ | async) {
                  <span class="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-red-500"></span>
                }
              </a>
              <a
                routerLink="/admin/banners"
                routerLinkActive="text-app-accent font-medium"
                class="px-3 py-2 rounded-lg hover:bg-app-field text-app-ink transition-colors"
                >Banners</a
              >
            </nav>
          </div>
          <div class="flex items-center gap-3">
            <a
              routerLink="/admin/orders"
              class="relative w-10 h-10 rounded-lg border border-app-border hover:bg-app-field transition-colors grid place-items-center"
              title="Incomplete orders"
              aria-label="Incomplete orders"
            >
              <svg viewBox="0 0 24 24" class="w-5 h-5 text-app-ink" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 8a2 2 0 0 0-2-2H5L4 4H2" />
                <path d="M7 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                <path d="M17 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                <path d="M5 6l1 10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2l1-8H6" />
              </svg>
              @if (hasIncompleteOrders$ | async) {
                <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-app-card"></span>
              }
            </a>
            <a routerLink="/" class="text-sm text-app-ink-muted hover:text-app-accent transition-colors">View store</a>
            <button
              type="button"
              class="text-sm px-3 py-2 rounded-lg border border-app-border text-app-ink hover:bg-app-field transition-colors"
              (click)="signOut()"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main class="flex-1 ij-page py-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly orders = inject(AdminOrderService);

  readonly hasIncompleteOrders$ = timer(0, 30_000).pipe(
    switchMap(() => this.orders.getIncompleteCount()),
    map((r) => (r?.count ?? 0) > 0),
    startWith(false),
    catchError(() => of(false)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  signOut() {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
