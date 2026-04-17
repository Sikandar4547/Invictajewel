import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { OrderDetailDto } from '../../models/api.types';
import { PkrCurrencyPipe } from '../../shared/pipes/pkr-currency.pipe';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, PkrCurrencyPipe, MatSnackBarModule],
  template: `
    <div class="ij-page max-w-xl py-8 md:py-10">
      <h1 class="font-display text-4xl mb-4 md:mb-6 text-app-ink">Track your order</h1>
      <form [formGroup]="form" (ngSubmit)="lookup()" class="flex flex-col sm:flex-row gap-3 sm:items-start">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 w-full min-w-0">
          <mat-label>Order number</mat-label>
          <input matInput formControlName="orderNumber" placeholder="ORD-..." />
          @if (errorFor('orderNumber'); as msg) {
            <mat-error>{{ msg }}</mat-error>
          }
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal sm:mt-1 shrink-0">Track</button>
      </form>
      @if (order) {
        <div class="mt-8 rounded-2xl border border-app-border p-6 bg-app-card shadow-card space-y-2">
          <p class="text-sm text-app-ink-muted">Status</p>
          <p class="text-2xl font-display text-app-accent">{{ order.orderStatus }}</p>
          <p class="font-mono text-sm text-app-ink">{{ order.orderNumber }}</p>
          <p class="text-sm text-app-ink-muted">{{ order.customerName }} — {{ order.customerEmail }}</p>
          <p class="text-sm text-app-ink-muted">{{ order.shippingAddress }}, {{ order.city }}</p>
          <p class="font-price font-semibold text-lg text-app-ink">{{ order.orderTotal | pkrCurrency }}</p>
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

  readonly form = this.fb.nonNullable.group({
    orderNumber: ['', [Validators.required, Validators.pattern(/^ORD-[A-Za-z0-9-]{6,}$/)]],
  });

  isFieldInvalid(fieldName: 'orderNumber'): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  errorFor(fieldName: 'orderNumber'): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.invalid || !(field.touched || field.dirty)) return null;
    if (field.errors?.['required']) return 'Order number is required.';
    if (field.errors?.['pattern']) return 'Order number must start with ORD-.';
    return 'Invalid order number.';
  }

  lookup() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const num = this.form.controls.orderNumber.value.trim();
    this.orders.track(num).subscribe({
      next: (o) => (this.order = o),
      error: () => {
        this.order = null;
        this.snack.open('Order not found', 'Close', { duration: 3000 });
      },
    });
  }
}
