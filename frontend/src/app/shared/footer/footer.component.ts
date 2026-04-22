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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 my-8 lg:my-10">
          <!-- 24/7 Support -->
          <button
            (click)="openWhatsApp()"
            class="flex flex-col items-center justify-center p-6 sm:p-7 lg:p-8 rounded-xl border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field hover:shadow-card"
          >
            <svg class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mb-3 sm:mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="support-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#support-gradient)" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="white" stroke-width="2.5"/>
              <line x1="50" y1="30" x2="50" y2="42" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="50" y1="50" x2="60" y2="50" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="50" cy="50" r="3" fill="white"/>
            </svg>
            <p class="font-semibold text-sm sm:text-base lg:text-lg mb-2 text-center">24/7 Support</p>
            <p class="text-xs sm:text-sm lg:text-sm opacity-70 text-center leading-relaxed">24/7 Customer Support</p>
          </button>

          <!-- Mail Us -->
          <button
            (click)="openEmail()"
            class="flex flex-col items-center justify-center p-6 sm:p-7 lg:p-8 rounded-xl border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field hover:shadow-card"
          >
            <svg class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mb-3 sm:mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="mail-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#F43F5E;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#mail-gradient)" />
              <rect x="26" y="32" width="48" height="36" fill="none" stroke="white" stroke-width="2.5" rx="2"/>
              <path d="M 26 32 L 50 48 L 74 32" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="font-semibold text-sm sm:text-base lg:text-lg mb-2 text-center">Mail Us</p>
            <p class="text-xs sm:text-sm lg:text-sm opacity-70 text-center leading-relaxed break-all">contact&#64;invictajewel.com</p>
          </button>

          <!-- Whatsapp Us -->
          <button
            (click)="openWhatsApp()"
            class="flex flex-col items-center justify-center p-6 sm:p-7 lg:p-8 rounded-xl border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field hover:shadow-card"
          >
            <svg class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mb-3 sm:mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="whatsapp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#whatsapp-gradient)" />
              <!-- WhatsApp Logo -->
              <g transform="translate(18 17) scale(2.1)">
                <path d="M15.565 0C7.057 0 .133 6.669.13 14.865c-.002 2.621.71 5.179 2.06 7.432L0 30l8.183-2.067a15.89 15.89 0 007.376 1.81h.006c8.508 0 15.432-6.67 15.435-14.866.002-3.97-1.602-7.707-4.517-10.516C23.569 1.551 19.694.001 15.565 0zm0 27.232h-.005c-2.302 0-4.56-.596-6.53-1.722l-.47-.268-4.854 1.226 1.296-4.56-.305-.467a11.983 11.983 0 01-1.962-6.576C2.738 8.052 8.494 2.511 15.57 2.511c3.426.001 6.647 1.288 9.07 3.623s3.756 5.44 3.754 8.742c-.003 6.813-5.758 12.356-12.83 12.356zm7.037-9.255c-.386-.185-2.282-1.084-2.636-1.209-.353-.123-.61-.187-.867.185-.256.372-.996 1.209-1.22 1.456-.226.248-.451.278-.837.093-.386-.186-1.629-.578-3.101-1.844-1.147-.984-1.921-2.2-2.146-2.573-.225-.371-.024-.572.169-.757.173-.165.386-.433.578-.65.192-.217.256-.372.386-.62.128-.247.064-.465-.033-.65-.097-.187-.867-2.015-1.19-2.758-.312-.724-.63-.627-.867-.639-.225-.01-.481-.013-.74-.013-.255 0-.674.093-1.028.465-.353.372-1.35 1.27-1.35 3.098 0 1.829 1.382 3.595 1.575 3.843.193.247 2.72 4 6.589 5.61.92.381 1.638.61 2.199.782.924.283 1.765.242 2.429.147.74-.107 2.282-.898 2.602-1.765.322-.867.322-1.611.226-1.766-.094-.155-.352-.248-.738-.435z" fill="white"/>
              </g>
            </svg>
            <p class="font-semibold text-sm sm:text-base lg:text-lg mb-2 text-center">Whatsapp Us</p>
            <p class="text-xs sm:text-sm lg:text-sm opacity-70 text-center leading-relaxed">+923232290524</p>
          </button>

          <!-- Find Us -->
          <button
            (click)="openMap()"
            class="flex flex-col items-center justify-center p-6 sm:p-7 lg:p-8 rounded-xl border-2 border-app-border hover:border-app-accent transition-all hover:bg-app-field hover:shadow-card"
          >
            <svg class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mb-3 sm:mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="location-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#D946EF;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#C084FC;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#location-gradient)" />
              <path d="M 50 28 C 40.06 28 32 36.06 32 46 C 32 58.5 50 74 50 74 C 50 74 68 58.5 68 46 C 68 36.06 59.94 28 50 28 Z M 50 56 C 44.48 56 40 51.52 40 46 C 40 40.48 44.48 36 50 36 C 55.52 36 60 40.48 60 46 C 60 51.52 55.52 56 50 56 Z" fill="white"/>
              <circle cx="50" cy="46" r="5" fill="white"/>
            </svg>
            <p class="font-semibold text-sm sm:text-base lg:text-lg mb-2 text-center">Find Us</p>
            <p class="text-xs sm:text-sm lg:text-sm opacity-70 text-center leading-relaxed">Race Course Road<br/>Westridge</p>
          </button>
        </div>
      </div>
    </section>

    <footer class="mt-16 border-t border-app-border bg-jewel-charcoal text-jewel-cream dark:bg-app-card dark:text-app-ink">
      <div class="ij-page py-10 lg:py-12 grid gap-8 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3 text-sm lg:text-base">
        <div>
          <p class="font-display text-lg lg:text-xl text-jewel-rose dark:text-app-accent mb-3">Invicta Jewel</p>
          <p class="opacity-80 dark:text-app-ink-muted leading-relaxed">Handpicked jewelry with transparent pricing and cash-on-delivery convenience.</p>
        </div>
        <div>
          <p class="font-semibold mb-3 lg:mb-4">Shop</p>
          <a routerLink="/category/rings" class="block opacity-80 hover:opacity-100 hover:text-jewel-rose dark:hover:text-app-accent transition-colors mb-2">Rings</a>
          <a routerLink="/category/necklaces" class="block opacity-80 hover:opacity-100 hover:text-jewel-rose dark:hover:text-app-accent transition-colors mb-2">Necklaces</a>
          <a routerLink="/track-order" class="block opacity-80 hover:opacity-100 hover:text-jewel-rose dark:hover:text-app-accent transition-colors">Track order</a>
        </div>
        <div>
          <p class="font-semibold mb-3 lg:mb-4">Newsletter</p>
          <p class="opacity-80 dark:text-app-ink-muted mb-3 leading-relaxed">Join for new arrivals and private sales.</p>
          <div class="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">
            <input
              type="email"
              placeholder="Email"
              class="ij-native-input flex-1 min-w-0"
            />
            <button type="button" class="rounded-md bg-jewel-gold hover:bg-jewel-gold-dark dark:bg-jewel-gold-light dark:hover:bg-jewel-gold px-4 py-2 text-white dark:text-jewel-charcoal font-medium transition-colors whitespace-nowrap">Join</button>
          </div>
        </div>
      </div>
      <div class="text-center text-xs opacity-60 dark:opacity-50 py-4 border-t border-white/10 dark:border-app-border">© {{ year }} Invicta Jewel</div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  private readonly whatsappNumber = '+923232290524';
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
    window.open(mailtoUrl, '_blank');
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
