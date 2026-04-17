import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminCategoryService } from '../../core/services/admin-category.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import { ToastService } from '../../core/services/toast.service';
import { getImageUrl } from '../../core/utils/image-url.util';
import { CategoryDto, SaveProductRequest } from '../../models/api.types';

interface CatOption {
  id: number;
  label: string;
}

function flattenCats(cats: CategoryDto[], depth = 0): CatOption[] {
  const out: CatOption[] = [];
  for (const c of cats) {
    const prefix = depth ? `${'\u2014'.repeat(depth)} ` : '';
    out.push({ id: c.id, label: `${prefix}${c.name}` });
    if (c.children?.length) out.push(...flattenCats(c.children, depth + 1));
  }
  return out;
}

function saleVsRegular(group: AbstractControl): ValidationErrors | null {
  const reg = group.get('regularPrice')?.value;
  const sale = group.get('salePrice')?.value;
  if (sale == null || sale === '') return null;
  const s = Number(sale);
  const r = Number(reg);
  if (!Number.isNaN(s) && !Number.isNaN(r) && s > r) return { saleTooHigh: true };
  return null;
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div class="ij-admin-form-wrap">
      <a [routerLink]="['/admin/products']" class="ij-back-link">← Back to Products</a>
      <h1 class="ij-admin-title">{{ isNew ? 'New Product' : 'Edit Product' }}</h1>
      @if (loading) {
        <div class="text-center py-5">Loading...</div>
      } @else {
        <div class="ij-admin-card">
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <div class="ij-form-grid">
              <div class="ij-field">
                <label>Product Name</label>
                <input type="text" formControlName="name" [class.is-invalid]="isFieldInvalid('name')" required />
                @if (errorFor('name'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label>Slug</label>
                <input type="text" formControlName="slug" [class.is-invalid]="isFieldInvalid('slug')" required />
                @if (errorFor('slug'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label>SKU</label>
                <input type="text" formControlName="sku" [class.is-invalid]="isFieldInvalid('sku')" required />
                @if (errorFor('sku'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label>Category</label>
                <select formControlName="categoryId" [class.is-invalid]="isFieldInvalid('categoryId')" required>
                  <option [value]="null" disabled>Select category</option>
                  @for (cat of categoryOptions; track cat.id) {<option [value]="cat.id">{{ cat.label }}</option>}
                </select>
                @if (errorFor('categoryId'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label>Regular Price</label>
                <input type="number" formControlName="regularPrice" [class.is-invalid]="isFieldInvalid('regularPrice')" min="0" step="0.01" required />
                @if (errorFor('regularPrice'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label>Sale Price</label>
                <input type="number" formControlName="salePrice" [class.is-invalid]="isFieldInvalid('salePrice')" min="0" step="0.01" />
                @if (errorFor('salePrice'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label>Stock Quantity</label>
                <input type="number" formControlName="stockQuantity" [class.is-invalid]="isFieldInvalid('stockQuantity')" min="0" />
                @if (errorFor('stockQuantity'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field"><label>Status</label><select formControlName="isActive"><option [ngValue]="true">Active</option><option [ngValue]="false">Hidden</option></select></div>
              <div class="ij-field"><label>New</label><select formControlName="isNew"><option [ngValue]="true">Yes</option><option [ngValue]="false">No</option></select></div>
              <div class="ij-field"><label>Upload Image</label><input type="file" accept="image/*" (change)="onFile($event)" /></div>
              <div class="ij-field ij-col-span-3"><label>Description</label><textarea rows="4" formControlName="description"></textarea></div>
            </div>
            @if (form.errors?.['saleTooHigh'] && (form.touched || form.dirty)) {
              <div class="ij-alert">Sale price must be less than or equal to regular price.</div>
            }
            @if (previewUrl) {
              <div class="ij-preview"><img [src]="previewUrl" alt="Image preview" /></div>
            }
            <div class="ij-actions">
              <button type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : (isNew ? 'Create Product' : 'Save Changes') }}</button>
              <a [routerLink]="['/admin/products']">Cancel</a>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .ij-admin-form-wrap { max-width: 1200px; margin: 0 auto; }
    .ij-back-link { color: #a8864c; text-decoration: none; display: inline-block; margin-bottom: 14px; }
    .ij-admin-title { color: #111; font-size: 1.8rem; font-weight: 700; margin-bottom: 18px; }
    .ij-admin-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .ij-form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .ij-col-span-2 { grid-column: span 2; }
    .ij-col-span-3 { grid-column: span 3; }
    .ij-field { display: flex; flex-direction: column; gap: 6px; }
    .ij-field label { font-size: 0.92rem; color: #374151; font-weight: 600; }
    .ij-field label::after { content: ''; color: #dc2626; font-weight: 700; }
    .ij-field label:has(+ input[required])::after { content: ' *'; color: #dc2626; }
    .ij-field label:has(+ select[required])::after { content: ' *'; color: #dc2626; }
    .ij-field label:has(+ textarea[required])::after { content: ' *'; color: #dc2626; }
    .ij-field input, .ij-field select, .ij-field textarea { border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #111827; padding: 10px 12px; width: 100%; }
    .ij-field .is-invalid { border-color: #dc2626; }
    .ij-error { color: #b91c1c; font-size: 0.8rem; }
    .ij-field input:focus, .ij-field select:focus, .ij-field textarea:focus { outline: none; border-color: #a8864c; box-shadow: 0 0 0 3px rgba(168,134,76,0.15); }
    .ij-preview img { max-width: 280px; max-height: 180px; border: 1px solid #d1d5db; border-radius: 8px; margin-top: 14px; object-fit: cover; }
    .ij-alert { margin-top: 14px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 10px; color: #92400e; }
    .ij-actions { display: flex; gap: 10px; margin-top: 20px; }
    .ij-actions button { border: 0; background: #a8864c; color: #fff; padding: 10px 16px; border-radius: 8px; font-weight: 600; }
    .ij-actions a { border: 1px solid #d1d5db; color: #111827; text-decoration: none; padding: 10px 16px; border-radius: 8px; }
    @media (max-width: 992px) { .ij-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ij-col-span-3 { grid-column: span 2; } }
    @media (max-width: 640px) { .ij-form-grid { grid-template-columns: 1fr; } .ij-col-span-2, .ij-col-span-3 { grid-column: span 1; } }
  `],
})
export class AdminProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoriesApi = inject(AdminCategoryService);
  private readonly productsApi = inject(AdminProductService);
  private readonly toast = inject(ToastService);

  isNew = true;
  private productId: number | null = null;
  loading = true;
  saving = false;
  categoryOptions: CatOption[] = [];
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.maxLength(500)]],
      slug: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(SLUG_PATTERN)]],
      sku: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      regularPrice: [0, [Validators.required, Validators.min(0)]],
      salePrice: [null as number | null, Validators.min(0)],
      stockQuantity: [0, Validators.min(0)],
      categoryId: [null as number | null, Validators.required],
      isActive: [true],
      isFeatured: [false],
      isNew: [false],
      imageUrl: [''],
    },
    { validators: saleVsRegular }
  );

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  errorFor(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.invalid || !(field.touched || field.dirty)) return null;
    if (field.errors?.['required']) return `${this.labelFor(fieldName)} is required.`;
    if (field.errors?.['maxlength']) return `${this.labelFor(fieldName)} is too long.`;
    if (field.errors?.['pattern']) return 'Slug must use lowercase letters, numbers, and hyphens only.';
    if (field.errors?.['min']) return `${this.labelFor(fieldName)} must be zero or greater.`;
    return 'Invalid value.';
  }

  private labelFor(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Name',
      slug: 'Slug',
      sku: 'SKU',
      categoryId: 'Category',
      regularPrice: 'Regular price',
      salePrice: 'Sale price',
      stockQuantity: 'Stock quantity',
    };
    return labels[fieldName] ?? 'Field';
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = !idParam;
    this.productId = idParam ? +idParam : null;

    const tree$ = this.categoriesApi.tree();
    if (this.isNew) {
      tree$.subscribe({
        next: (tree) => {
          this.categoryOptions = flattenCats(tree);
          this.loading = false;
        },
        error: () => {
          this.toast.error('Failed to load categories');
          this.loading = false;
        },
      });
      return;
    }

    forkJoin({ tree: tree$, product: this.productsApi.getById(this.productId!) }).pipe(
      catchError(() => {
        this.toast.error('Product not found');
        this.router.navigateByUrl('/admin/products');
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.categoryOptions = flattenCats(res.tree);
      const p = res.product;
      const primary = p.primaryImageUrl ?? p.imageUrl ?? p.images?.find((i) => i.isPrimary)?.imageUrl ?? '';
      const primaryCat = p.primaryCategoryId ?? p.categories?.[0]?.id ?? null;
      this.form.patchValue({
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description ?? '',
        regularPrice: p.regularPrice,
        salePrice: p.salePrice ?? null,
        stockQuantity: p.stockQuantity,
        categoryId: primaryCat,
        isActive: p.isActive ?? true,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        imageUrl: primary,
      });
      if (primary) this.previewUrl = getImageUrl(primary);
      this.loading = false;
    });
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile = file ?? null;
    if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);
    if (file) this.previewUrl = URL.createObjectURL(file);
  }

  save() {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const v = this.form.getRawValue();
    const cid = v.categoryId!;
    const body: SaveProductRequest = {
      name: (v.name ?? '').trim(),
      slug: (v.slug ?? '').trim().toLowerCase(),
      sku: (v.sku ?? '').trim(),
      description: v.description?.trim() || null,
      regularPrice: Number(v.regularPrice),
      salePrice: v.salePrice != null && !Number.isNaN(Number(v.salePrice)) ? Number(v.salePrice) : null,
      stockQuantity: Number(v.stockQuantity) || 0,
      isActive: v.isActive ?? true,
      isFeatured: !!v.isFeatured,
      isNew: !!v.isNew,
      categoryIds: [cid],
      primaryCategoryId: cid,
      categoryId: cid,
      imageUrl: this.isNew ? (v.imageUrl?.trim() || null) : v.imageUrl?.trim() ?? null,
    };

    if (this.isNew) {
      this.productsApi.create(body).subscribe({
        next: (p) => this.finish(p.id),
        error: (e) => this.err(e),
      });
      return;
    }

    if (this.selectedFile) {
      delete (body as { imageUrl?: string | null }).imageUrl;
    } else {
      body.imageUrl = v.imageUrl?.trim() ?? null;
    }

    this.productsApi.update(this.productId!, body).subscribe({
      next: () => this.finish(this.productId!),
      error: (e) => this.err(e),
    });
  }

  private finish(id: number) {
    const file = this.selectedFile;
    if (!file) {
      this.saving = false;
      this.toast.success(this.isNew ? 'Created' : 'Saved');
      this.router.navigateByUrl('/admin/products');
      return;
    }
    this.productsApi.uploadImage(id, file).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(this.isNew ? 'Created with image' : 'Saved with image');
        this.router.navigateByUrl('/admin/products');
      },
      error: (e) => {
        this.saving = false;
        this.toast.error(e?.error?.message ?? 'Image upload failed');
      },
    });
  }

  private err(e: unknown) {
    this.saving = false;
    const ex = e as { error?: { message?: string } | string };
    const msg =
      typeof ex?.error === 'string' ? ex.error : ex?.error?.message ?? (e as Error)?.message ?? 'Save failed';
    this.toast.error(msg);
  }
}
