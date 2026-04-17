import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CartService } from './core/services/cart.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    @if (!isAdminRoute()) {
      <app-header />
    }
    <main class="min-h-[60vh] bg-app-bg text-app-ink transition-colors duration-300">
      <router-outlet />
    </main>
    @if (!isAdminRoute()) {
      <app-footer />
    }
  `,
})
export class AppComponent implements OnInit {
  private readonly cart = inject(CartService);
  private readonly theme = inject(ThemeService);
  protected readonly router = inject(Router);

  protected isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  ngOnInit(): void {
    this.cart.refresh().subscribe();
  }
}
