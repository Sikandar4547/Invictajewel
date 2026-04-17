import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { AdminCategoryService } from '../../core/services/admin-category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDeleteDialogService } from '../../shared/dialogs/confirm-delete-dialog.service';
import { CategoryDto } from '../../models/api.types';

interface FlatRow {
  id: number;
  name: string;
  slug: string;
  depth: number;
  isActive: boolean;
}

function flattenTree(cats: CategoryDto[], depth = 0): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const c of cats) {
    rows.push({ id: c.id, name: c.name, slug: c.slug, depth, isActive: c.isActive });
    if (c.children?.length) rows.push(...flattenTree(c.children, depth + 1));
  }
  return rows;
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [AsyncPipe, RouterLink, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <h1 class="font-display text-3xl text-app-ink">Categories</h1>
      <a mat-flat-button color="primary" routerLink="/admin/categories/new" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal">
        New category
      </a>
    </div>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <div class="flex justify-center py-16">
          <mat-spinner diameter="40" />
        </div>
      } @else if (vm.error) {
        <p class="text-red-600 dark:text-red-400">{{ vm.error }}</p>
      } @else {
        <div class="rounded-xl border border-app-border bg-app-card overflow-hidden shadow-card">
          <table class="w-full text-left text-sm">
            <thead class="bg-app-field/80 border-b border-app-border text-app-ink-muted">
              <tr>
                <th class="p-4 font-medium">Name</th>
                <th class="p-4 font-medium">Slug</th>
                <th class="p-4 font-medium">Status</th>
                <th class="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (row of vm.rows; track row.id) {
                <tr class="border-b border-app-border/80 hover:bg-app-field/40">
                  <td class="p-4 text-app-ink">
                    <span class="text-app-ink-muted select-none">{{ indent(row.depth) }}</span>
                    {{ row.name }}
                  </td>
                  <td class="p-4 text-app-ink-muted font-mono text-xs">{{ row.slug }}</td>
                  <td class="p-4">{{ row.isActive ? 'Active' : 'Hidden' }}</td>
                  <td class="p-4 text-right">
                    <div class="flex justify-end gap-2 flex-wrap">
                      <a [routerLink]="['/admin/categories', row.id]" class="px-3 py-1.5 rounded border border-app-border text-app-ink hover:bg-app-field transition-colors">Edit</a>
                      <button type="button" class="px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50 transition-colors" (click)="remove(row.id, row.name)">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }
  `,
})
export class AdminCategoriesComponent {
  private readonly api = inject(AdminCategoryService);
  private readonly toast = inject(ToastService);
  private readonly confirmDelete = inject(ConfirmDeleteDialogService);

  readonly vm$ = this.api.tree().pipe(
    map((tree) => ({ loading: false as const, error: undefined as string | undefined, rows: flattenTree(tree) })),
    catchError((e) =>
      of({
        loading: false as const,
        error: (e?.error && JSON.stringify(e.error)) || e?.message || 'Failed to load categories',
        rows: [] as FlatRow[],
      })
    )
  );

  indent(depth: number): string {
    return depth ? `${'\u2014'.repeat(depth)} ` : '';
  }

  remove(id: number, name: string) {
    this.confirmDelete
      .confirm({
        title: 'Delete category',
        message: `Are you sure you want to delete “${name}”? This cannot be undone.`,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.api.delete(id))
      )
      .subscribe({
        next: () => {
          this.toast.success('Category deleted', { duration: 2500 });
          window.location.reload();
        },
        error: (e) => this.toast.error(e?.error?.message ?? 'Delete failed'),
      });
  }
}
