import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="mt-16 border-t border-jewel-rose/40 bg-jewel-charcoal text-jewel-cream">
      <div class="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <p class="font-display text-xl text-jewel-rose mb-2">Invicta Jewel</p>
          <p class="opacity-80">Handpicked jewelry with transparent pricing and cash-on-delivery convenience.</p>
        </div>
        <div>
          <p class="font-semibold mb-2">Shop</p>
          <a routerLink="/category/rings" class="block opacity-80 hover:text-jewel-gold">Rings</a>
          <a routerLink="/category/necklaces" class="block opacity-80 hover:text-jewel-gold">Necklaces</a>
          <a routerLink="/track-order" class="block opacity-80 hover:text-jewel-gold">Track order</a>
        </div>
        <div>
          <p class="font-semibold mb-2">Newsletter</p>
          <p class="opacity-80 mb-2">Join for new arrivals and private sales.</p>
          <div class="flex gap-2">
            <input
              type="email"
              placeholder="Email"
              class="flex-1 rounded-md px-3 py-2 text-jewel-text"
            />
            <button type="button" class="rounded-md bg-jewel-gold px-4 py-2 text-white font-medium">Join</button>
          </div>
        </div>
      </div>
      <div class="text-center text-xs opacity-60 py-4 border-t border-white/10">© {{ year }} Invicta Jewel</div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
