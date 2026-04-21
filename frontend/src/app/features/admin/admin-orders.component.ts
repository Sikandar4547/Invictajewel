import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { AdminOrderService } from '../../core/services/admin-order.service';
import { ToastService } from '../../core/services/toast.service';
import { getImageUrl } from '../../core/utils/image-url.util';
import { OrderDetailDto } from '../../models/api.types';

type Vm = {
  items: OrderDetailDto[];
  total: number;
  error?: string;
};

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DecimalPipe, MatButtonModule],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl text-app-ink">Orders</h1>
        <p class="text-app-ink-muted text-sm mt-1">Only incomplete orders are shown. Mark an order as complete to remove it from this list.</p>
      </div>
      <button mat-stroked-button type="button" (click)="reload()" class="!border-app-border !text-app-ink">Refresh</button>
    </div>

    @if (vm$ | async; as vm) {
      @if (vm.error) {
        <p class="text-red-600 dark:text-red-400">{{ vm.error }}</p>
      } @else if (vm.items.length === 0) {
        <div class="rounded-xl border border-app-border bg-app-card p-6 shadow-card">
          <p class="text-app-ink font-medium">No incomplete orders.</p>
          <p class="text-app-ink-muted text-sm mt-1">You’re all caught up.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @for (o of vm.items; track o.id) {
            <article class="rounded-xl border border-app-border bg-app-card shadow-card overflow-hidden">
              <header class="p-5 border-b border-app-border flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="font-display text-lg text-app-ink">{{ o.orderNumber }}</span>
                    <span class="text-xs px-2 py-1 rounded-full bg-app-field border border-app-border text-app-ink-muted">{{ o.orderStatus }}</span>
                    <span class="text-xs text-app-ink-muted">Placed {{ o.createdAt | date: 'medium' }}</span>
                  </div>
                  <div class="text-sm text-app-ink mt-2">
                    <span class="font-medium">{{ o.customerName }}</span>
                    <span class="text-app-ink-muted"> · {{ o.customerPhone }} · {{ o.customerEmail }}</span>
                  </div>
                  <div class="text-sm text-app-ink-muted mt-1">
                    {{ o.shippingAddress }}, {{ o.city }}{{ o.postalCode ? (' ' + o.postalCode) : '' }}
                  </div>
                  @if (o.notes) {
                    <div class="text-sm mt-2">
                      <span class="text-app-ink-muted">Notes:</span>
                      <span class="text-app-ink">{{ o.notes }}</span>
                    </div>
                  }
                </div>
                <div class="flex items-end gap-3">
                  <div class="text-right">
                    <div class="text-xs text-app-ink-muted">Total</div>
                    <div class="font-display text-xl text-app-ink">{{ o.orderTotal | number: '1.2-2' }}</div>
                    <div class="text-xs text-app-ink-muted mt-1">Payment: {{ o.paymentMethod }}</div>
                  </div>
                  <button mat-flat-button color="primary" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal" (click)="complete(o)">
                    Mark complete
                  </button>
                </div>
              </header>

              <div class="p-5">
                <div class="rounded-xl border border-app-border overflow-x-auto">
                  <table class="w-full text-left text-sm min-w-[720px]">
                    <thead class="bg-app-field/80 border-b border-app-border text-app-ink-muted">
                      <tr>
                        <th class="p-3 w-20">Image</th>
                        <th class="p-3">Product</th>
                        <th class="p-3 text-right">Unit</th>
                        <th class="p-3 text-right">Qty</th>
                        <th class="p-3 text-right">Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (it of o.items; track it.productName + '_' + it.unitPrice + '_' + it.quantity) {
                        <tr class="border-b border-app-border/80 last:border-b-0 hover:bg-app-field/40">
                          <td class="p-3">
                            <img
                              [src]="img(it.productImageUrl)"
                              alt=""
                              class="w-14 h-14 object-cover rounded-lg border border-app-border bg-app-field"
                            />
                          </td>
                          <td class="p-3 text-app-ink font-medium">{{ it.productName }}</td>
                          <td class="p-3 text-right">{{ it.unitPrice | number: '1.2-2' }}</td>
                          <td class="p-3 text-right">{{ it.quantity }}</td>
                          <td class="p-3 text-right">{{ it.totalPrice | number: '1.2-2' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          }
        </div>
      }
    }
  `,
})
export class AdminOrdersComponent {
  private readonly api = inject(AdminOrderService);
  private readonly toast = inject(ToastService);

  private readonly reload$ = new BehaviorSubject<void>(undefined);

  readonly vm$ = this.reload$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.api.list({ page: 1, pageSize: 50, incompleteOnly: true }).pipe(
        map((r) => ({ items: r.items, total: r.totalCount, error: undefined } satisfies Vm)),
        catchError((e) =>
          of({
            items: [],
            total: 0,
            error: e?.error?.message ?? e?.message ?? 'Failed to load orders',
          } satisfies Vm)
        )
      )
    )
  );

  reload() {
    this.reload$.next();
  }

  readonly img = (url?: string | null) => getImageUrl(url);

  complete(o: OrderDetailDto) {
    this.api.markComplete(o.id).subscribe({
      next: () => {
        this.toast.success('Order marked as complete', { duration: 2000 });
        this.reload();
      },
      error: (e) => this.toast.error(e?.error?.message ?? 'Failed to update order status'),
    });
  }
}

