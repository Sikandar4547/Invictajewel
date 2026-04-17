import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-5xl">
      <h1 class="font-display text-3xl text-app-ink mb-2">Dashboard</h1>
      <p class="text-app-ink-muted mb-8">Manage catalog data. All changes are saved to the database via the API.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          routerLink="/admin/categories"
          class="block rounded-xl border border-app-border bg-app-card p-6 shadow-card hover:border-app-accent/50 transition-colors"
        >
          <span class="font-display text-lg text-app-ink">Categories</span>
          <p class="text-sm text-app-ink-muted mt-2">Tree, create, edit, delete</p>
        </a>
        <a
          routerLink="/admin/products"
          class="block rounded-xl border border-app-border bg-app-card p-6 shadow-card hover:border-app-accent/50 transition-colors"
        >
          <span class="font-display text-lg text-app-ink">Products</span>
          <p class="text-sm text-app-ink-muted mt-2">List, pricing, images</p>
        </a>
        <a
          routerLink="/admin/banners"
          class="block rounded-xl border border-app-border bg-app-card p-6 shadow-card hover:border-app-accent/50 transition-colors"
        >
          <span class="font-display text-lg text-app-ink">Banners</span>
          <p class="text-sm text-app-ink-muted mt-2">Homepage slides, links, order</p>
        </a>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {}
