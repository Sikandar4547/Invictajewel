import { PkrCurrencyPipe } from '../../shared/pipes/pkr-currency.pipe';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { getOrCreateCartId, resetCartId } from '../../core/services/cart-id.storage';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatStepperModule,
    MatButtonModule,
    PkrCurrencyPipe,
    AsyncPipe,
  ],
  template: `
    <div class="bg-app-bg text-app-ink min-h-screen">
      <div class="ij-page max-w-4xl py-8 md:py-10">
        <h1 class="font-display text-4xl mb-6 md:mb-8 text-app-ink">Checkout</h1>
        @if (!confirmation) {
          <mat-stepper linear #stepper>
            <mat-step [stepControl]="infoForm" label="Your details">
              <form [formGroup]="infoForm" class="ij-checkout-form">
                <div class="ij-field">
                  <label>Full name</label>
                  <input type="text" formControlName="customerName" [class.is-invalid]="isFieldInvalid('customerName')" />
                  @if (errorFor('customerName'); as msg) { <small class="ij-error">{{ msg }}</small> }
                </div>
                <div class="ij-field">
                  <label>Email</label>
                  <input type="email" formControlName="customerEmail" [class.is-invalid]="isFieldInvalid('customerEmail')" />
                  @if (errorFor('customerEmail'); as msg) { <small class="ij-error">{{ msg }}</small> }
                </div>
                <div class="ij-field">
                  <label>Phone</label>
                  <input type="text" formControlName="customerPhone" [class.is-invalid]="isFieldInvalid('customerPhone')" />
                  @if (errorFor('customerPhone'); as msg) { <small class="ij-error">{{ msg }}</small> }
                </div>
                <div class="ij-field">
                  <label>Shipping address</label>
                  <textarea rows="3" formControlName="shippingAddress" [class.is-invalid]="isFieldInvalid('shippingAddress')"></textarea>
                  @if (errorFor('shippingAddress'); as msg) { <small class="ij-error">{{ msg }}</small> }
                </div>
                <div class="ij-field">
                  <label>City</label>
                  <input type="text" formControlName="city" [class.is-invalid]="isFieldInvalid('city')" />
                  @if (errorFor('city'); as msg) { <small class="ij-error">{{ msg }}</small> }
                </div>
                <div class="ij-field">
                  <label>Postal code</label>
                  <input type="text" formControlName="postalCode" [class.is-invalid]="isFieldInvalid('postalCode')" />
                  @if (errorFor('postalCode'); as msg) { <small class="ij-error">{{ msg }}</small> }
                </div>
                <div class="ij-field">
                  <label>Notes</label>
                  <textarea rows="2" formControlName="notes"></textarea>
                </div>
                <div class="flex justify-end">
                  <button type="button" (click)="stepper.next()" [disabled]="infoForm.invalid" class="ij-button">
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
                    <span class="font-price">{{ line.lineTotal | pkrCurrency }}</span>
                  </div>
                }
                <div class="flex justify-between font-semibold text-app-accent text-lg border-t border-app-border pt-4 mt-2">
                  <span>Total</span>
                  <span class="font-price">{{ cart.total | pkrCurrency }}</span>
                </div>
                <p class="text-sm text-app-ink-muted">Payment: cash on delivery (COD).</p>
                <div class="flex justify-between mt-6">
                  <button type="button" (click)="stepper.previous()" class="ij-button-secondary">Back</button>
                  <button type="button" (click)="submit()" [disabled]="submitting" class="ij-button">
                    Place order
                  </button>
                </div>
              </div>
            }
          </mat-step>
        </mat-stepper>
      } @else {
        <div class="rounded-2xl border border-app-border bg-app-card p-8 shadow-card">
          <p class="text-app-accent font-semibold tracking-wide text-sm uppercase mb-2">Thank you</p>
          <h2 class="font-display text-3xl mb-2 text-app-ink">Order confirmed</h2>
          <p class="text-app-ink-muted mb-4">Your order number is <span class="font-mono font-semibold text-app-ink">{{ confirmation.orderNumber }}</span>.</p>
          <p class="text-sm text-app-ink-muted mb-6">
            Total: <span class="font-price text-app-accent">{{ confirmation.orderTotal | pkrCurrency }}</span> — you will pay on delivery.
          </p>
          <a mat-raised-button color="primary" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal" routerLink="/">Continue shopping</a>
        </div>
      }
      </div>
    </div>
  `,
  styles: [`
    .ij-checkout-form { display: flex; flex-direction: column; gap: 16px; }
    .ij-field { display: flex; flex-direction: column; gap: 6px; }
    .ij-field label { font-size: 0.92rem; color: #374151; font-weight: 600; }
    .ij-field input, .ij-field textarea { border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; padding: 10px 12px; width: 100%; font-family: inherit; }
    .ij-field .is-invalid { border-color: #dc2626; }
    .ij-error { color: #b91c1c; font-size: 0.8rem; }
    .ij-field input:focus, .ij-field textarea:focus { outline: none; border-color: #a8864c; box-shadow: 0 0 0 3px rgba(168,134,76,0.15); }
    .ij-button { background-color: #a8864c; color: white; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 600; cursor: pointer; }
    .ij-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .ij-button:hover:not(:disabled) { background-color: #8f7039; }
    .ij-button-secondary { background-color: transparent; color: #a8864c; border: 1px solid #a8864c; border-radius: 8px; padding: 10px 16px; font-weight: 600; cursor: pointer; }
    .ij-button-secondary:hover { background-color: rgba(168,134,76,0.1); }
  `],
})
export class CheckoutPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cartApi = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly toast = inject(ToastService);

  submitting = false;
  confirmation: { orderNumber: string; orderTotal: number } | null = null;

  cart$ = this.cartApi.refresh();

  readonly infoForm = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(200)]],
    customerEmail: ['', [Validators.required, Validators.email]],
    customerPhone: ['', [Validators.required, Validators.maxLength(32)]],
    shippingAddress: ['', [Validators.required, Validators.maxLength(500)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', Validators.maxLength(20)],
    notes: [''],
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.infoForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  errorFor(fieldName: string): string | null {
    const field = this.infoForm.get(fieldName);
    if (!field || !field.invalid || !(field.touched || field.dirty)) return null;
    if (field.errors?.['required']) return `${this.labelFor(fieldName)} is required.`;
    if (field.errors?.['email']) return 'Please enter a valid email address.';
    if (field.errors?.['maxlength']) return `${this.labelFor(fieldName)} is too long.`;
    return 'Invalid value.';
  }

  private labelFor(fieldName: string): string {
    const labels: Record<string, string> = {
      customerName: 'Full name',
      customerEmail: 'Email',
      customerPhone: 'Phone',
      shippingAddress: 'Shipping address',
      city: 'City',
      postalCode: 'Postal code',
    };
    return labels[fieldName] ?? 'Field';
  }

  submit() {
    if (this.infoForm.invalid || this.submitting) {
      this.infoForm.markAllAsTouched();
      return;
    }
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
          this.toast.success('Order placed successfully!', { duration: 3000 });
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.error ?? 'Unable to place order';
          this.toast.error(msg);
        },
      });
  }
}
