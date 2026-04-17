import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
                routerLink="/admin/banners"
                routerLinkActive="text-app-accent font-medium"
                class="px-3 py-2 rounded-lg hover:bg-app-field text-app-ink transition-colors"
                >Banners</a
              >
            </nav>
          </div>
          <div class="flex items-center gap-3">
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

  signOut() {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
