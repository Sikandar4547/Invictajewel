import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10">
      <h1 class="font-display text-4xl mb-6 text-jewel-charcoal">Your cart</h1>
      @if (cart$ | async; as cart) {
        @if (!cart.items.length) {
          <p class="text-neutral-600 mb-4">Your cart is empty.</p>
          <a routerLink="/" class="text-jewel-gold font-medium">Continue shopping</a>
        } @else {
          <div class="space-y-4 mb-8">
            @for (line of cart.items; track line.id) {
              <div class="flex gap-4 items-center border rounded-xl p-4 bg-white shadow-sm">
                <img [src]="line.imageUrl || '/favicon.ico'" class="w-20 h-20 object-cover rounded-lg" [alt]="line.productName" />
                <div class="flex-1">
                  <p class="font-medium text-jewel-charcoal">{{ line.productName }}</p>
                  <p class="text-sm text-neutral-500">{{ line.unitPrice | currency }} each</p>
                </div>
                <div class="flex items-center gap-2">
                  <button mat-icon-button aria-label="decrease" (click)="delta(line.id, line.quantity - 1)">
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span class="w-8 text-center">{{ line.quantity }}</span>
                  <button mat-icon-button aria-label="increase" (click)="delta(line.id, line.quantity + 1)">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div class="font-price font-semibold w-24 text-right">{{ line.lineTotal | currency }}</div>
                <button mat-icon-button color="warn" aria-label="remove" (click)="remove(line.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
            <div>
              <p class="text-sm text-neutral-600">Subtotal</p>
              <p class="font-price text-2xl text-jewel-gold">{{ cart.subtotal | currency }}</p>
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
