import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProductListDto } from '../../models/api.types';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { getImageUrl } from '../../core/utils/image-url.util';
import { PkrCurrencyPipe } from '../pipes/pkr-currency.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, PkrCurrencyPipe],
  template: `
    <mat-card class="h-full flex flex-col overflow-hidden rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 bg-app-card text-app-ink border border-app-border">
      <a [routerLink]="['/product', product.slug]" class="block aspect-[3/4] sm:aspect-[4/5] bg-app-field overflow-hidden">
        <img
          [src]="getImageUrl(product.primaryImageUrl)"
          [alt]="product.name"
          loading="lazy"
          class="w-full h-full min-h-[280px] sm:min-h-[320px] object-cover hover:scale-105 transition-transform duration-300"
        />
      </a>
      <mat-card-content class="flex-1 flex flex-col gap-2.5 p-4 sm:p-5">
        <a [routerLink]="['/product', product.slug]" class="font-display text-sm sm:text-base font-semibold text-app-ink hover:text-app-accent line-clamp-2 leading-snug transition-colors">
          {{ product.name }}
        </a>
        <div class="flex items-baseline gap-2 flex-wrap">
          @if (product.salePrice != null && product.salePrice < product.regularPrice) {
            <span class="font-price text-base font-bold text-app-accent">{{ product.salePrice | pkrCurrency }}</span>
            <span class="text-xs text-app-ink-muted line-through">{{ product.regularPrice | pkrCurrency }}</span>
            <span class="ml-auto text-xs font-semibold uppercase tracking-wide bg-red-50 dark:bg-red-950/40 text-jewel-sale dark:text-red-300 px-2 py-1 rounded-md">Sale</span>
          } @else {
            <span class="font-price text-base font-bold text-app-accent">{{ product.regularPrice | pkrCurrency }}</span>
          }
        </div>
        <button mat-flat-button color="primary" class="w-full mt-auto !bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal hover:!brightness-95 transition-all" (click)="add($event)">Add to Cart</button>
      </mat-card-content>
    </mat-card>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductListDto;

  protected readonly getImageUrl = getImageUrl;

  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  add(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    this.cart.addItem(this.product.id, 1).subscribe({
      next: () => this.toast.success('Added to cart', { duration: 2000 }),
      error: () => this.toast.error('Could not add item'),
    });
  }
}
