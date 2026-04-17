import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Contact Us Section -->
    <section class="mt-16 bg-app-card text-app-ink border-t border-app-border">
      <div class="ij-page py-12">
        <h2 class="text-center text-2xl md:text-3xl font-display text-jewel-gold dark:text-jewel-gold-light mb-4">CONTACT US!</h2>
        
        <!-- Contact Cards Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 my-8">
          <!-- 24/7 Support -->
          <button
            (click)="openWhatsApp()"
            class="flex flex-col items-center justify-center p-4 md:p-6 rounded-full border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field"
          >
            <div class="text-3xl md:text-4xl mb-2">⏰</div>
            <p class="font-semibold text-sm md:text-base mb-1">24/7 Support</p>
            <p class="text-xs md:text-sm opacity-70">24/7 Customer Support</p>
          </button>

          <!-- Mail Us -->
          <button
            (click)="openEmail()"
            class="flex flex-col items-center justify-center p-4 md:p-6 rounded-full border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field"
          >
            <div class="text-3xl md:text-4xl mb-2">💬</div>
            <p class="font-semibold text-sm md:text-base mb-1">Mail Us</p>
            <p class="text-xs md:text-sm opacity-70">contact&#64;invictajewel.com</p>
          </button>

          <!-- Whatsapp Us -->
          <button
            (click)="openWhatsApp()"
            class="flex flex-col items-center justify-center p-4 md:p-6 rounded-full border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field"
          >
            <div class="text-3xl md:text-4xl mb-2">💬</div>
            <p class="font-semibold text-sm md:text-base mb-1">Whatsapp Us</p>
            <p class="text-xs md:text-sm opacity-70">+923232985524</p>
          </button>

          <!-- Find Us -->
          <button
            (click)="openMap()"
            class="flex flex-col items-center justify-center p-4 md:p-6 rounded-full border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field"
          >
            <div class="text-3xl md:text-4xl mb-2">📍</div>
            <p class="font-semibold text-sm md:text-base mb-1">Find Us</p>
            <p class="text-xs md:text-sm opacity-70">Race Course Road Westridge</p>
          </button>
        </div>
      </div>
    </section>

    <footer class="mt-16 border-t border-app-border bg-jewel-charcoal text-jewel-cream dark:bg-app-card dark:text-app-ink">
      <div class="ij-page py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <p class="font-display text-xl text-jewel-rose dark:text-app-accent mb-2">Invicta Jewel</p>
          <p class="opacity-80 dark:text-app-ink-muted">Handpicked jewelry with transparent pricing and cash-on-delivery convenience.</p>
        </div>
        <div>
          <p class="font-semibold mb-2">Shop</p>
          <a routerLink="/category/rings" class="block opacity-80 hover:opacity-100 hover:text-jewel-rose dark:hover:text-app-accent transition-colors">Rings</a>
          <a routerLink="/category/necklaces" class="block opacity-80 hover:opacity-100 hover:text-jewel-rose dark:hover:text-app-accent transition-colors">Necklaces</a>
          <a routerLink="/track-order" class="block opacity-80 hover:opacity-100 hover:text-jewel-rose dark:hover:text-app-accent transition-colors">Track order</a>
        </div>
        <div>
          <p class="font-semibold mb-2">Newsletter</p>
          <p class="opacity-80 dark:text-app-ink-muted mb-2">Join for new arrivals and private sales.</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Email"
              class="ij-native-input flex-1 min-w-0"
            />
            <button type="button" class="rounded-md bg-jewel-gold hover:bg-jewel-gold-dark dark:bg-jewel-gold-light dark:hover:bg-jewel-gold px-4 py-2 text-white dark:text-jewel-charcoal font-medium transition-colors">Join</button>
          </div>
        </div>
      </div>
      <div class="text-center text-xs opacity-60 dark:opacity-50 py-4 border-t border-white/10 dark:border-app-border">© {{ year }} Invicta Jewel</div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  private readonly whatsappNumber = '+923232985524';
  private readonly email = 'contact@invictajewel.com';
  private readonly mapAddress = 'Race Course Road, Rawalpindi, Pakistan';

  /**
   * Opens WhatsApp with a pre-filled message.
   * Works on both mobile and desktop.
   */
  openWhatsApp(): void {
    const message = 'Hello! I would like to inquire about your jewelry.';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Opens the default email client with a pre-filled address.
   * Works on both mobile and desktop.
   */
  openEmail(): void {
    const mailtoUrl = `mailto:${this.email}?subject=Inquiry from Invicta Jewel&body=Hello,\n\nI would like to inquire about your products.\n\nThank you!`;
    window.location.href = mailtoUrl;
  }

  /**
   * Opens Google Maps with the store location.
   * Works on both mobile and desktop.
   */
  openMap(): void {
    const encodedAddress = encodeURIComponent(this.mapAddress);
    const mapsUrl = `https://www.google.com/maps/search/${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  }
}
