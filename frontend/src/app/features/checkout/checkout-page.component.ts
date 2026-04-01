import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { getOrCreateCartId, resetCartId } from '../../core/services/cart-id.storage';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CurrencyPipe,
    AsyncPipe,
    MatSnackBarModule,
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-10">
      <h1 class="font-display text-4xl mb-6 text-jewel-charcoal">Checkout</h1>
      @if (!confirmation) {
        <mat-stepper linear #stepper>
          <mat-step [stepControl]="infoForm" label="Your details">
            <form [formGroup]="infoForm" class="grid gap-4 pt-4">
              <mat-form-field appearance="outline">
                <mat-label>Full name</mat-label>
                <input matInput formControlName="customerName" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="customerEmail" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="customerPhone" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Shipping address</mat-label>
                <textarea matInput rows="3" formControlName="shippingAddress"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput formControlName="city" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Postal code</mat-label>
                <input matInput formControlName="postalCode" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Notes</mat-label>
                <textarea matInput rows="2" formControlName="notes"></textarea>
              </mat-form-field>
              <div class="flex justify-end">
                <button mat-raised-button color="primary" matStepperNext [disabled]="infoForm.invalid" class="!bg-jewel-gold !text-white">
                  Continue
                </button>
              </div>
            </form>
          </mat-step>
          <mat-step label="Review &amp; confirm">
            @if (cart$ | async; as cart) {
              <div class="pt-4 space-y-3">
                @for (line of cart.items; track line.id) {
                  <div class="flex justify-between text-sm">
                    <span>{{ line.productName }} × {{ line.quantity }}</span>
                    <span class="font-price">{{ line.lineTotal | currency }}</span>
                  </div>
                }
                <div class="flex justify-between font-semibold text-jewel-gold text-lg border-t pt-3">
                  <span>Total</span>
                  <span class="font-price">{{ cart.total | currency }}</span>
                </div>
                <p class="text-sm text-neutral-600">Payment: cash on delivery (COD).</p>
                <div class="flex justify-between mt-6">
                  <button mat-button matStepperBack>Back</button>
                  <button mat-raised-button color="primary" class="!bg-jewel-gold !text-white" (click)="submit()" [disabled]="submitting">
                    Place order
                  </button>
                </div>
              </div>
            }
          </mat-step>
        </mat-stepper>
      } @else {
        <div class="rounded-2xl border border-jewel-rose/40 bg-white p-8 shadow">
          <p class="text-jewel-gold font-semibold tracking-wide text-sm uppercase mb-2">Thank you</p>
          <h2 class="font-display text-3xl mb-2 text-jewel-charcoal">Order confirmed</h2>
          <p class="text-neutral-700 mb-4">Your order number is <span class="font-mono font-semibold">{{ confirmation.orderNumber }}</span>.</p>
          <p class="text-sm text-neutral-600 mb-6">
            Total: <span class="font-price text-jewel-gold">{{ confirmation.orderTotal | currency }}</span> — you will pay on delivery.
          </p>
          <a mat-raised-button color="primary" class="!bg-jewel-gold !text-white" routerLink="/">Continue shopping</a>
        </div>
      }
    </div>
  `,
})
export class CheckoutPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cartApi = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly snack = inject(MatSnackBar);

  submitting = false;
  confirmation: { orderNumber: string; orderTotal: number } | null = null;

  cart$ = this.cartApi.refresh();

  readonly infoForm = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    customerEmail: ['', [Validators.required, Validators.email]],
    customerPhone: ['', Validators.required],
    shippingAddress: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: [''],
    notes: [''],
  });

  submit() {
    if (this.infoForm.invalid || this.submitting) return;
    this.submitting = true;
    const v = this.infoForm.getRawValue();
    this.orders
      .create({
        cartIdentifier: getOrCreateCartId(),
        customerName: v.customerName,
        customerEmail: v.customerEmail,
        customerPhone: v.customerPhone,
        shippingAddress: v.shippingAddress,
        city: v.city,
        postalCode: v.postalCode || undefined,
        notes: v.notes || undefined,
      })
      .subscribe({
        next: (o) => {
          this.confirmation = { orderNumber: o.orderNumber, orderTotal: o.orderTotal };
          resetCartId();
          this.cartApi.refresh().subscribe();
          this.submitting = false;
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.error ?? 'Unable to place order';
          this.snack.open(msg, 'Close', { duration: 4000 });
        },
      });
  }
}
