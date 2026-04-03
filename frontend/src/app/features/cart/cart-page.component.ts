import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';
import { getImageUrl } from '../../core/utils/image-url.util';
import { PkrCurrencyPipe } from '../../shared/pipes/pkr-currency.pipe';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [AsyncPipe, PkrCurrencyPipe, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="bg-white dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen">
      <div class="max-w-4xl mx-auto px-4 py-10">
        <h1 class="font-display text-4xl mb-6 text-jewel-charcoal dark:text-dark-text">Your cart</h1>
        @if (cart$ | async; as cart) {
          @if (!cart.items.length) {
            <p class="text-neutral-600 dark:text-dark-text-secondary mb-4">Your cart is empty.</p>
            <a routerLink="/" class="text-jewel-gold dark:text-jewel-gold-light font-medium">Continue shopping</a>
          } @else {
            <div class="space-y-4 mb-8">
              @for (line of cart.items; track line.id) {
                <div class="flex gap-4 items-center border dark:border-dark-border rounded-xl p-4 bg-white dark:bg-dark-bg-secondary shadow-sm">
                  <img [src]="getImageUrl(line.imageUrl)" class="w-20 h-20 object-cover rounded-lg" [alt]="line.productName" />
                  <div class="flex-1">
                    <p class="font-medium text-jewel-charcoal dark:text-dark-text">{{ line.productName }}</p>
                    <p class="text-sm text-neutral-500 dark:text-dark-text-secondary">{{ line.unitPrice | pkrCurrency }} each</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button mat-icon-button aria-label="decrease" (click)="delta(line.id, line.quantity - 1)" class="dark:text-dark-text">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span class="w-8 text-center">{{ line.quantity }}</span>
                    <button mat-icon-button aria-label="increase" (click)="delta(line.id, line.quantity + 1)" class="dark:text-dark-text">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                  <div class="font-price font-semibold w-24 text-right">{{ line.lineTotal | pkrCurrency }}</div>
                  <button mat-icon-button color="warn" aria-label="remove" (click)="remove(line.id)" class="dark:text-red-400">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t dark:border-dark-border pt-6">
              <div>
                <p class="text-sm text-neutral-600 dark:text-dark-text-secondary">Subtotal</p>
                <p class="font-price text-2xl text-jewel-gold dark:text-jewel-gold-light">{{ cart.subtotal | pkrCurrency }}</p>
              </div>
            <div class="flex gap-3">
              <a mat-stroked-button routerLink="/">Continue shopping</a>
              <a mat-raised-button color="primary" class="!bg-jewel-gold !text-white" routerLink="/checkout">Checkout</a>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class CartPageComponent {
  private readonly cartApi = inject(CartService);
  cart$ = this.cartApi.refresh();

  protected readonly getImageUrl = getImageUrl;

  delta(itemId: number, q: number) {
    if (q < 1) {
      this.remove(itemId);
      return;
    }
    this.cartApi.updateItem(itemId, q).subscribe(() => (this.cart$ = this.cartApi.refresh()));
  }

  remove(itemId: number) {
    this.cartApi.removeItem(itemId).subscribe(() => (this.cart$ = this.cartApi.refresh()));
  }
}
