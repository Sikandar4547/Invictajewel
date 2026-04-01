import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, RouterLink, MatButtonModule, ProductCardComponent],
  template: `
    <section class="relative overflow-hidden bg-jewel-charcoal text-jewel-cream">
      <div class="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p class="uppercase tracking-[0.25em] text-jewel-rose text-xs mb-4">Invicta Jewel</p>
          <h1 class="font-display text-4xl md:text-5xl leading-tight mb-6">Elevated jewelry for everyday brilliance.</h1>
          <p class="text-white/80 mb-8 max-w-xl">
            Discover rings, necklaces, and signature pieces — responsive shopping, curated collections, and secure cash-on-delivery
            checkout.
          </p>
          <a mat-raised-button color="primary" routerLink="/category/rings" class="!bg-jewel-gold !text-white">Shop rings</a>
        </div>
        <div class="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src="https://images.unsplash.com/photo-1515562140607-2a3e35c7ed6f?w=900&h=900&fit=crop"
            alt="Jewelry flatlay"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-14">
      <div class="flex items-end justify-between gap-4 mb-6">
        <h2 class="font-display text-3xl text-jewel-charcoal">Featured</h2>
        <a routerLink="/category/rings" class="text-jewel-gold font-medium hover:underline text-sm">View catalog</a>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        @for (p of (featured$ | async) ?? []; track p.id) {
          <app-product-card [product]="p" />
        }
      </div>
    </section>

    <section class="bg-white border-y border-jewel-rose/30">
      <div class="max-w-6xl mx-auto px-4 py-14">
        <h2 class="font-display text-3xl text-jewel-charcoal mb-6">New arrivals</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          @for (p of (new$ | async) ?? []; track p.id) {
            <app-product-card [product]="p" />
          }
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-14">
      <h2 class="font-display text-3xl text-jewel-charcoal mb-6">Shop by category</h2>
      <div class="grid md:grid-cols-3 gap-4">
        @for (c of (categories$ | async) ?? []; track c.id) {
          <a
            [routerLink]="['/category', c.slug]"
            class="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-jewel-cream shadow hover:shadow-lg transition"
          >
            <img [src]="c.imageUrl || ''" [alt]="c.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute bottom-3 left-4 text-white font-display text-2xl">{{ c.name }}</div>
          </a>
        }
      </div>
    </section>
  `,
})
export class HomeComponent {
  private readonly products = inject(ProductService);
  private readonly categories = inject(CategoryService);

  readonly featured$ = this.products.featured(8);
  readonly new$ = this.products.newArrivals(8);
  readonly categories$ = this.categories.activeTree();
}
