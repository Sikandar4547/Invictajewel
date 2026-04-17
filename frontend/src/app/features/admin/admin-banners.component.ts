import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AdminBannerService } from '../../core/services/admin-banner.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDeleteDialogService } from '../../shared/dialogs/confirm-delete-dialog.service';
import { BannerDto } from '../../models/api.types';
import { getImageUrl } from '../../core/utils/image-url.util';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold text-app-ink">Banners</h1>
        <a routerLink="/admin/banners/new" class="px-4 py-2 rounded-lg bg-app-accent text-white">New Banner</a>
      </div>

      <div class="rounded-xl border border-app-border bg-app-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-app-field text-app-ink">
              <tr>
                <th class="text-left p-3">Preview</th>
                <th class="text-left p-3">Title</th>
                <th class="text-left p-3">Link</th>
                <th class="text-left p-3">Status</th>
                <th class="text-left p-3">Order</th>
                <th class="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items; track item.id) {
                <tr class="border-t border-app-border">
                  <td class="p-3"><img [src]="getImageUrl(item.imageUrl)" [alt]="item.title" class="h-12 w-24 object-cover rounded border border-app-border" /></td>
                  <td class="p-3">{{ item.title }}</td>
                  <td class="p-3">{{ item.linkUrl }}</td>
                  <td class="p-3">{{ item.isActive ? 'Active' : 'Hidden' }}</td>
                  <td class="p-3">{{ item.displayOrder }}</td>
                  <td class="p-3">
                    <div class="flex justify-end gap-2">
                      <a [routerLink]="['/admin/banners', item.id]" class="px-3 py-1.5 rounded border border-app-border">Edit</a>
                      <button type="button" class="px-3 py-1.5 rounded border border-red-300 text-red-700" (click)="remove(item)">Delete</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td class="p-6 text-app-ink-muted" colspan="6">No banners found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminBannersComponent implements OnInit {
  private readonly api = inject(AdminBannerService);
  private readonly toast = inject(ToastService);
  private readonly confirmDelete = inject(ConfirmDeleteDialogService);
  protected readonly getImageUrl = getImageUrl;

  items: BannerDto[] = [];

  ngOnInit(): void {
    this.load();
  }

  remove(item: BannerDto): void {
    this.confirmDelete
      .confirm({
        title: 'Delete banner',
        message: `Are you sure you want to delete “${item.title}”? This cannot be undone.`,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.api.delete(item.id))
      )
      .subscribe({
        next: () => {
          this.toast.success('Banner deleted', { duration: 2000 });
          this.load();
        },
        error: () => this.toast.error('Delete failed'),
      });
  }

  private load(): void {
    this.api.list().subscribe({
      next: (items) => (this.items = items),
      error: () => this.toast.error('Failed to load banners'),
    });
  }
}
