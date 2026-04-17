import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="bg-app-bg text-app-ink min-h-screen">
      <div class="ij-page py-12 sm:py-14 lg:py-16">
        <!-- Back button -->
        <div class="mb-8">
          <a routerLink="/" mat-button class="!text-app-accent hover:!text-app-accent !bg-transparent !p-0">
            <mat-icon class="mr-2">arrow_back</mat-icon>
            Back to Home
          </a>
        </div>

        <!-- Hero Section -->
        <div class="mb-12 lg:mb-16">
          <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl text-jewel-gold dark:text-jewel-gold-light mb-6">About Invicta Jewel</h1>
          <p class="text-lg sm:text-xl text-app-ink-muted max-w-3xl">
            Discover the story behind Invicta Jewel, where tradition meets elegance and craftsmanship becomes art.
          </p>
        </div>

        <!-- Content Grid -->
        <div class="grid gap-12 lg:gap-16">
          <!-- Our Story -->
          <div class="max-w-4xl">
            <h2 class="font-display text-3xl sm:text-4xl text-jewel-gold dark:text-jewel-gold-light mb-6">Our Story</h2>
            <div class="space-y-4 text-app-ink text-base sm:text-lg leading-relaxed">
              <p>
                Welcome to Invicta Jewel, where tradition meets elegance. Our journey began with a simple vision: to bring 
                exquisite handcrafted jewelry to those who appreciate the finer things in life. Each piece in our collection 
                is carefully selected to ensure the highest quality and timeless beauty.
              </p>
              <p>
                With years of experience in the jewelry industry, our dedicated team has built a reputation for excellence, 
                transparency, and customer satisfaction. We believe that every piece of jewelry tells a story, and we're honored 
                to be part of your special moments.
              </p>
              <p>
                From timeless classics to contemporary designs, our curated selection caters to every taste and occasion. 
                Whether you're looking for an engagement ring, a wedding band, or a statement piece, Invicta Jewel has something 
                special waiting for you.
              </p>
            </div>
          </div>

          <!-- Our Commitment -->
          <div class="max-w-4xl bg-jewel-gold/5 dark:bg-jewel-gold/10 p-8 sm:p-10 rounded-xl border border-jewel-gold/20">
            <h2 class="font-display text-3xl sm:text-4xl text-jewel-gold dark:text-jewel-gold-light mb-6">Our Commitment</h2>
            <div class="space-y-4 text-app-ink text-base sm:text-lg leading-relaxed">
              <p>
                At Invicta Jewel, we are committed to providing exceptional customer service and authentic jewelry pieces. 
                We offer competitive pricing with the convenience of cash-on-delivery, making luxury jewelry accessible to everyone.
              </p>
              <p>
                Our transparent approach ensures you know exactly what you're getting when you shop with us. We stand behind every 
                piece with our quality guarantee and are always available to answer your questions about our products.
              </p>
              <p>
                Thank you for choosing Invicta Jewel. We look forward to serving you and becoming your trusted jewelry destination.
              </p>
            </div>
          </div>

          <!-- Why Choose Us -->
          <div class="max-w-4xl">
            <h2 class="font-display text-3xl sm:text-4xl text-jewel-gold dark:text-jewel-gold-light mb-8">Why Choose Us</h2>
            <div class="grid gap-6 sm:grid-cols-2">
              <div class="bg-app-card border border-app-border rounded-xl p-6">
                <h3 class="font-semibold text-lg text-jewel-gold dark:text-jewel-gold-light mb-3 flex items-center gap-2">
                  <span class="text-2xl">✓</span>
                  Authentic Quality
                </h3>
                <p class="text-app-ink-muted">Every piece is handpicked to ensure authenticity and superior craftsmanship.</p>
              </div>

              <div class="bg-app-card border border-app-border rounded-xl p-6">
                <h3 class="font-semibold text-lg text-jewel-gold dark:text-jewel-gold-light mb-3 flex items-center gap-2">
                  <span class="text-2xl">✓</span>
                  Transparent Pricing
                </h3>
                <p class="text-app-ink-muted">No hidden charges. What you see is what you pay, with detailed product information.</p>
              </div>

              <div class="bg-app-card border border-app-border rounded-xl p-6">
                <h3 class="font-semibold text-lg text-jewel-gold dark:text-jewel-gold-light mb-3 flex items-center gap-2">
                  <span class="text-2xl">✓</span>
                  Easy Payment
                </h3>
                <p class="text-app-ink-muted">Convenient cash-on-delivery option available, plus other flexible payment methods.</p>
              </div>

              <div class="bg-app-card border border-app-border rounded-xl p-6">
                <h3 class="font-semibold text-lg text-jewel-gold dark:text-jewel-gold-light mb-3 flex items-center gap-2">
                  <span class="text-2xl">✓</span>
                  Customer Support
                </h3>
                <p class="text-app-ink-muted">24/7 support team ready to assist you with any questions or concerns.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="mt-16 py-12 bg-jewel-gold/10 dark:bg-jewel-gold/5 rounded-xl border border-jewel-gold/20 text-center">
          <h2 class="font-display text-2xl sm:text-3xl text-jewel-gold dark:text-jewel-gold-light mb-4">Ready to Explore?</h2>
          <p class="text-app-ink-muted mb-8 max-w-2xl mx-auto">Browse our collection and discover the perfect piece for your special moments.</p>
          <a routerLink="/" mat-flat-button class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal hover:!brightness-95">
            Start Shopping
          </a>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {}
