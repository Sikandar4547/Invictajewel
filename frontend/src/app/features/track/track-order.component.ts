import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { OrderDetailDto } from '../../models/api.types';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CurrencyPipe, MatSnackBarModule],
  template: `
    <div class="max-w-xl mx-auto px-4 py-10">
      <h1 class="font-display text-4xl mb-4 text-jewel-charcoal">Track your order</h1>
      <form [formGroup]="form" (ngSubmit)="lookup()" class="flex gap-2 items-start">
        <mat-form-field appearance="outline" class="flex-1">
          <mat-label>Order number</mat-label>
          <input matInput formControlName="orderNumber" placeholder="ORD-..." />
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" class="!bg-jewel-gold !text-white mt-1">Track</button>
      </form>
      @if (order) {
        <div class="mt-8 rounded-2xl border p-6 bg-white shadow-sm space-y-2">
          <p class="text-sm text-neutral-500">Status</p>
          <p class="text-2xl font-display text-jewel-gold">{{ order.orderStatus }}</p>
          <p class="font-mono text-sm">{{ order.orderNumber }}</p>
          <p class="text-sm text-neutral-600">{{ order.customerName }} — {{ order.customerEmail }}</p>
          <p class="text-sm text-neutral-600">{{ order.shippingAddress }}, {{ order.city }}</p>
          <p class="font-price font-semibold text-lg">{{ order.orderTotal | currency }}</p>
        </div>
      }
    </div>
  `,
})
export class TrackOrderComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orders = inject(OrderService);
  private readonly snack = inject(MatSnackBar);

  order: OrderDetailDto | null = null;

  readonly form = this.fb.nonNullable.group({ orderNumber: [''] });

  lookup() {
    const num = this.form.controls.orderNumber.value.trim();
    if (!num) return;
    this.orders.track(num).subscribe({
      next: (o) => (this.order = o),
      error: () => {
        this.order = null;
        this.snack.open('Order not found', 'Close', { duration: 3000 });
      },
    });
  }
}
