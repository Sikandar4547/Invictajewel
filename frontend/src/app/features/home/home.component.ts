import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { BannerService } from '../../core/services/banner.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { BannerSliderComponent } from '../../shared/banner-slider/banner-slider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, ProductCardComponent, BannerSliderComponent],
  template: `
    <app-banner-slider [banners]="banners$ | async" />

    <section class="bg-app-bg border-y border-app-border/80 text-app-ink">
      <div class="ij-page py-12 md:py-14">
        <h2 class="font-display text-3xl text-app-ink mb-6 md:mb-8">New arrivals</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          @for (p of (new$ | async) ?? []; track p.id) {
            <app-product-card [product]="p" />
          }
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {
  private readonly products = inject(ProductService);
  private readonly banners = inject(BannerService);

  readonly banners$ = this.banners.active();
  readonly new$ = this.products.newArrivals(8);
}
