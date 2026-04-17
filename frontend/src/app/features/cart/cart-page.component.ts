import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { getImageUrl } from '../../core/utils/image-url.util';
import { PkrCurrencyPipe } from '../../shared/pipes/pkr-currency.pipe';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [AsyncPipe, PkrCurrencyPipe, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="bg-app-bg text-app-ink min-h-screen">
      <div class="ij-page max-w-4xl py-8 md:py-10">
        <h1 class="font-display text-4xl mb-6 md:mb-8 text-app-ink">Your cart</h1>
        @if (cart$ | async; as cart) {
          @if (!cart.items.length) {
            <p class="text-app-ink-muted mb-4">Your cart is empty.</p>
            <a routerLink="/" class="text-app-accent font-medium hover:underline">Continue shopping</a>
          } @else {
            <div class="space-y-4 mb-8">
              @for (line of cart.items; track line.id) {
                <div class="flex gap-4 items-center border border-app-border rounded-xl p-4 bg-app-card shadow-card">
                  <img [src]="getImageUrl(line.imageUrl)" class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg" [alt]="line.productName" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-app-ink">{{ line.productName }}</p>
                    <p class="text-sm text-app-ink-muted">{{ line.unitPrice | pkrCurrency }} each</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button mat-icon-button aria-label="decrease" (click)="delta(line.id, line.quantity - 1)" class="text-app-ink">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span class="w-8 text-center">{{ line.quantity }}</span>
                    <button mat-icon-button aria-label="increase" (click)="delta(line.id, line.quantity + 1)" class="text-app-ink">
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
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-app-border pt-8">
              <div>
                <p class="text-sm text-app-ink-muted">Subtotal</p>
                <p class="font-price text-2xl text-app-accent">{{ cart.subtotal | pkrCurrency }}</p>
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
  private readonly toast = inject(ToastService);
  cart$ = this.cartApi.refresh();

  protected readonly getImageUrl = getImageUrl;

  delta(itemId: number, q: number) {
    if (q < 1) {
      this.remove(itemId);
      return;
    }
    this.cartApi.updateItem(itemId, q).subscribe({
      next: () => {
        this.cart$ = this.cartApi.refresh();
        this.toast.success('Cart updated');
      },
      error: () => this.toast.error('Failed to update cart'),
    });
  }

  remove(itemId: number) {
    this.cartApi.removeItem(itemId).subscribe({
      next: () => {
        this.cart$ = this.cartApi.refresh();
        this.toast.success('Item removed from cart', { duration: 2000 });
      },
      error: () => this.toast.error('Failed to remove item'),
    });
  }
}
