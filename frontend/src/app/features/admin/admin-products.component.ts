import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, switchMap, map, startWith, catchError, of } from 'rxjs';
import { AdminProductService } from '../../core/services/admin-product.service';
import { ToastService } from '../../core/services/toast.service';
import { getImageUrl } from '../../core/utils/image-url.util';
import { ProductListDto } from '../../models/api.types';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="font-display text-3xl text-app-ink">Products</h1>
      <a mat-flat-button color="primary" routerLink="/admin/products/new" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal">
        New product
      </a>
    </div>

    <form [formGroup]="filterForm" class="flex flex-wrap gap-4 mb-6 items-end">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="min-w-[200px] flex-1">
        <mat-label>Search</mat-label>
        <input matInput formControlName="search" placeholder="Name or SKU" (keydown.enter)="applySearch()" />
      </mat-form-field>
      <button mat-stroked-button type="button" (click)="applySearch()">Search</button>
    </form>

    @if (vm$ | async; as vm) {
      @if (vm.error) {
        <p class="text-red-600 dark:text-red-400">{{ vm.error }}</p>
      } @else {
        <div class="rounded-xl border border-app-border bg-app-card overflow-x-auto shadow-card">
          <table class="w-full text-left text-sm min-w-[640px]">
            <thead class="bg-app-field/80 border-b border-app-border text-app-ink-muted">
              <tr>
                <th class="p-3 w-20">Image</th>
                <th class="p-3">Name</th>
                <th class="p-3">SKU</th>
                <th class="p-3">Regular</th>
                <th class="p-3">Sale</th>
                <th class="p-3">Active</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of vm.items; track p.id) {
                <tr class="border-b border-app-border/80 hover:bg-app-field/40">
                  <td class="p-3">
                    <img
                      [src]="img(p)"
                      alt=""
                      class="w-14 h-14 object-cover rounded-lg border border-app-border bg-app-field"
                    />
                  </td>
                  <td class="p-3 text-app-ink font-medium">{{ p.name }}</td>
                  <td class="p-3 text-app-ink-muted font-mono text-xs">{{ p.sku }}</td>
                  <td class="p-3">{{ p.regularPrice | number: '1.2-2' }}</td>
                  <td class="p-3">{{ p.salePrice != null ? (p.salePrice | number: '1.2-2') : '—' }}</td>
                  <td class="p-3">{{ p.isActive ? 'Yes' : 'No' }}</td>
                  <td class="p-3 text-right space-x-1">
                    <a mat-button [routerLink]="['/admin/products', p.id]">Edit</a>
                    <button mat-button color="warn" type="button" (click)="remove(p)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <mat-paginator
          [length]="vm.total"
          [pageIndex]="pageIndex"
          [pageSize]="pageSize"
          [pageSizeOptions]="[12, 24, 48]"
          (page)="onPage($event)"
          showFirstLastButtons
          class="bg-transparent text-app-ink mt-4"
        />
      }
    }
  `,
})
export class AdminProductsComponent {
  private readonly api = inject(AdminProductService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly filterForm = this.fb.nonNullable.group({ search: '' });
  readonly reload$ = new BehaviorSubject<void>(undefined);
  pageIndex = 0;
  pageSize = 24;

  readonly vm$ = this.reload$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.api
        .list({
          page: this.pageIndex + 1,
          pageSize: this.pageSize,
          search: this.filterForm.getRawValue().search?.trim() || '',
        })
        .pipe(
          map((r) => ({ items: r.items, total: r.totalCount, error: undefined as string | undefined })),
          catchError((e) =>
            of({
              items: [] as ProductListDto[],
              total: 0,
              error: e?.message ?? 'Failed to load products',
            })
          )
        )
    )
  );

  applySearch() {
    this.pageIndex = 0;
    this.reload$.next();
  }

  readonly img = (p: ProductListDto) => getImageUrl(p.primaryImageUrl ?? p.imageUrl);

  onPage(ev: PageEvent) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.reload$.next();
  }

  remove(p: ProductListDto) {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    this.api.delete(p.id).subscribe({
      next: () => {
        this.toast.success('Product deleted', { duration: 2500 });
        this.reload$.next();
      },
      error: (e) => this.toast.error(e?.error?.message ?? 'Delete failed'),
    });
  }
}
