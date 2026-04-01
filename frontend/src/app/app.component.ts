import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="min-h-[60vh]">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class AppComponent implements OnInit {
  private readonly cart = inject(CartService);

  ngOnInit(): void {
    this.cart.refresh().subscribe();
  }
}
