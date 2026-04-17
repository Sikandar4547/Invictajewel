import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminBannerService } from '../../core/services/admin-banner.service';
import { ToastService } from '../../core/services/toast.service';
import { SaveBannerRequest } from '../../models/api.types';
import { getImageUrl } from '../../core/utils/image-url.util';

const BANNER_UPLOAD_PATH_PATTERN = /^\/?uploads\/banners\/.+/i;

@Component({
  selector: 'app-admin-banner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="ij-admin-form-wrap">
      <a [routerLink]="['/admin/banners']" class="ij-back-link">← Back to Banners</a>
      <h1 class="ij-admin-title">{{ isNew ? 'New Banner' : 'Edit Banner' }}</h1>

      <div class="ij-admin-card">
        <form [formGroup]="form" (ngSubmit)="save()" novalidate>
          <div class="ij-form-grid">
            <div class="ij-field">
              <label>Title</label>
              <input type="text" formControlName="title" [class.is-invalid]="isFieldInvalid('title')" required />
              @if (errorFor('title'); as msg) { <small class="ij-error">{{ msg }}</small> }
            </div>
            <div class="ij-field">
              <label>Display Order</label>
              <input type="number" formControlName="displayOrder" [class.is-invalid]="isFieldInvalid('displayOrder')" min="0" required />
              @if (errorFor('displayOrder'); as msg) { <small class="ij-error">{{ msg }}</small> }
            </div>
            <div class="ij-field">
              <label>Status</label>
              <select formControlName="isActive">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Hidden</option>
              </select>
            </div>
            <div class="ij-field">
              <label>Upload Image</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" (change)="onFile($event)" />
              @if (errorFor('imageUrl'); as msg) { <small class="ij-error">{{ msg }}</small> }
            </div>
          </div>

          @if (previewUrl) {
            <div class="ij-preview">
              <img [src]="previewUrl" alt="Banner preview" />
            </div>
          }

          <div class="ij-actions">
            <button type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : (isNew ? 'Create Banner' : 'Save Changes') }}</button>
            <a [routerLink]="['/admin/banners']">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .ij-admin-form-wrap { max-width: 1200px; margin: 0 auto; }
    .ij-back-link { color: #a8864c; text-decoration: none; display: inline-block; margin-bottom: 14px; }
    .ij-admin-title { color: #111; font-size: 1.8rem; font-weight: 700; margin-bottom: 18px; }
    .ij-admin-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .ij-form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .ij-col-span-2 { grid-column: span 2; }
    .ij-field { display: flex; flex-direction: column; gap: 6px; }
    .ij-field label { font-size: 0.92rem; color: #374151; font-weight: 600; }
    .ij-field label::after { content: ''; color: #dc2626; font-weight: 700; }
    .ij-field label:has(+ input[required])::after { content: ' *'; color: #dc2626; }
    .ij-field label:has(+ select[required])::after { content: ' *'; color: #dc2626; }
    .ij-field label:has(+ textarea[required])::after { content: ' *'; color: #dc2626; }
    .ij-field input, .ij-field select, .ij-field textarea {
      border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; padding: 10px 12px; width: 100%;
    }
    .ij-field .is-invalid { border-color: #dc2626; }
    .ij-error { color: #b91c1c; font-size: 0.8rem; }
    .ij-field input:focus, .ij-field select:focus, .ij-field textarea:focus { outline: none; border-color: #a8864c; box-shadow: 0 0 0 3px rgba(168,134,76,0.15); }
    .ij-preview img { max-width: 280px; max-height: 160px; object-fit: cover; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 16px; }
    .ij-actions { display: flex; gap: 10px; margin-top: 20px; }
    .ij-actions button { border: 0; background: #a8864c; color: #fff; padding: 10px 16px; border-radius: 8px; font-weight: 600; }
    .ij-actions a { border: 1px solid #d1d5db; color: #111827; text-decoration: none; padding: 10px 16px; border-radius: 8px; }
    @media (max-width: 992px) { .ij-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ij-col-span-2 { grid-column: span 2; } }
    @media (max-width: 640px) { .ij-form-grid { grid-template-columns: 1fr; } .ij-col-span-2 { grid-column: span 1; } }
  `],
})
export class AdminBannerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AdminBannerService);
  private readonly toast = inject(ToastService);
  protected readonly getImageUrl = getImageUrl;

  isNew = true;
  private bannerId: number | null = null;
  saving = false;
  previewUrl: string | null = null;

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    imageUrl: ['', [Validators.required, Validators.pattern(BANNER_UPLOAD_PATH_PATTERN)]],
    isActive: [true, Validators.required],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
  });

  isFieldInvalid(fieldName: 'title' | 'imageUrl' | 'displayOrder'): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  errorFor(fieldName: 'title' | 'imageUrl' | 'displayOrder'): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.invalid || !(field.touched || field.dirty)) return null;
    if (field.errors?.['required']) {
      if (fieldName === 'imageUrl') return 'Banner image is required.';
      return `${fieldName === 'displayOrder' ? 'Display order' : 'Title'} is required.`;
    }
    if (field.errors?.['maxlength']) return 'Title is too long.';
    if (field.errors?.['pattern']) return 'Image URL must be under /uploads/banners.';
    if (field.errors?.['min']) return 'Display order must be zero or greater.';
    return 'Invalid value.';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = !idParam;
    this.bannerId = idParam ? +idParam : null;
    if (!this.bannerId) return;
    this.api.getById(this.bannerId).subscribe({
      next: (b) => {
        this.form.patchValue({ title: b.title, imageUrl: b.imageUrl, isActive: b.isActive, displayOrder: b.displayOrder });
        this.previewUrl = getImageUrl(b.imageUrl);
      },
      error: () => this.router.navigateByUrl('/admin/banners'),
    });
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.toast.warning('Only jpeg, png, and webp are allowed');
      return;
    }
    this.api.uploadImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({ imageUrl: res.imageUrl });
        this.previewUrl = getImageUrl(res.imageUrl);
      },
      error: () => this.toast.error('Upload failed'),
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload: SaveBannerRequest = this.form.getRawValue() as SaveBannerRequest;
    const req$ = this.isNew ? this.api.create(payload) : this.api.update(this.bannerId!, payload);
    req$.subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(this.isNew ? 'Banner created' : 'Banner updated');
        this.router.navigateByUrl('/admin/banners');
      },
      error: (e) => {
        this.saving = false;
        this.toast.error(e?.error?.message ?? 'Save failed');
      },
    });
  }
}
