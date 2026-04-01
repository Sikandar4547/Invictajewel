import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductListDto } from '../../models/api.types';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatSnackBarModule, CurrencyPipe],
  template: `
    <mat-card class="h-full flex flex-col overflow-hidden rounded-xl shadow-md bg-white">
      <a [routerLink]="['/product', product.slug]" class="block aspect-square bg-jewel-cream overflow-hidden">
        <img
          [src]="product.primaryImageUrl || '/favicon.ico'"
          [alt]="product.name"
          loading="lazy"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </a>
      <mat-card-content class="flex-1 flex flex-col gap-2 pt-3">
        <div class="flex items-start justify-between gap-2">
          <a [routerLink]="['/product', product.slug]" class="font-display text-lg text-jewel-charcoal hover:text-jewel-gold line-clamp-2">
            {{ product.name }}
          </a>
          @if (product.isOnSale || (product.salePrice != null && product.salePrice < product.regularPrice)) {
            <span class="shrink-0 text-xs font-semibold uppercase tracking-wide bg-red-50 text-jewel-sale px-2 py-0.5 rounded">Sale</span>
          }
        </div>
        <div class="font-price text-jewel-gold mt-auto flex flex-wrap items-baseline gap-2">
          @if (product.salePrice != null && product.salePrice < product.regularPrice) {
            <span class="text-xl font-semibold">{{ product.salePrice | currency }}</span>
            <span class="text-sm text-neutral-500 line-through">{{ product.regularPrice | currency }}</span>
          } @else {
            <span class="text-xl font-semibold">{{ product.regularPrice | currency }}</span>
          }
        </div>
        <button mat-flat-button color="primary" class="w-full !bg-jewel-gold !text-white" (click)="add($event)">Add to Cart</button>
      </mat-card-content>
    </mat-card>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductListDto;

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
