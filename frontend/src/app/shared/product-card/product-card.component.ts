import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductListDto } from '../../models/api.types';
import { CartService } from '../../core/services/cart.service';
import { getImageUrl } from '../../core/utils/image-url.util';
import { PkrCurrencyPipe } from '../pipes/pkr-currency.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatSnackBarModule, PkrCurrencyPipe],
  template: `
    <mat-card class="h-full flex flex-col overflow-hidden rounded-lg shadow-md bg-white dark:bg-dark-bg-secondary text-light-text dark:text-dark-text border border-neutral-200 dark:border-dark-border">
      <a [routerLink]="['/product', product.slug]" class="block aspect-[3/4] bg-jewel-cream dark:bg-dark-bg overflow-hidden">
        <img
          [src]="getImageUrl(product.primaryImageUrl)"
          [alt]="product.name"
          loading="lazy"
          class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </a>
      <mat-card-content class="flex-1 flex flex-col gap-3 p-4">
        <a [routerLink]="['/product', product.slug]" class="font-display text-base text-jewel-charcoal dark:text-dark-text hover:text-jewel-gold dark:hover:text-jewel-gold-light line-clamp-2 leading-tight">
          {{ product.name }}
        </a>
        <div class="flex items-baseline gap-2">
          @if (product.salePrice != null && product.salePrice < product.regularPrice) {
            <span class="font-price text-lg font-bold text-jewel-gold dark:text-jewel-gold-light">{{ product.salePrice | pkrCurrency }}</span>
            <span class="text-xs text-neutral-500 dark:text-dark-text-secondary line-through">{{ product.regularPrice | pkrCurrency }}</span>
            <span class="ml-auto text-xs font-semibold uppercase tracking-wide bg-red-50 dark:bg-red-900/30 text-jewel-sale dark:text-red-300 px-2 py-1 rounded">Sale</span>
          } @else {
            <span class="font-price text-lg font-bold text-jewel-gold dark:text-jewel-gold-light">{{ product.regularPrice | pkrCurrency }}</span>
          }
        </div>
        <button mat-flat-button color="primary" class="w-full mt-auto !bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal hover:shadow-lg transition-shadow" (click)="add($event)">Add to Cart</button>
      </mat-card-content>
    </mat-card>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductListDto;

  protected readonly getImageUrl = getImageUrl;

  constructor(
    private readonly cart: CartService,
    private readonly snack: MatSnackBar
  ) {}

  add(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    this.cart.addItem(this.product.id, 1).subscribe({
      next: () => this.snack.open('Added to cart', 'Close', { duration: 2000 }),
      error: () => this.snack.open('Could not add item', 'Close', { duration: 3000 }),
    });
  }
}
