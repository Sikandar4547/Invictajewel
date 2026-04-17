import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminCategoryService } from '../../core/services/admin-category.service';
import { ToastService } from '../../core/services/toast.service';
import { CategoryDto, SaveCategoryRequest } from '../../models/api.types';

interface ParentOption {
  id: number;
  label: string;
}

function flattenForParents(cats: CategoryDto[], depth = 0, excludeId?: number): ParentOption[] {
  const out: ParentOption[] = [];
  for (const c of cats) {
    if (excludeId != null && c.id === excludeId) continue;
    const prefix = depth ? `${'\u2014'.repeat(depth)} ` : '';
    out.push({ id: c.id, label: `${prefix}${c.name}` });
    if (c.children?.length) out.push(...flattenForParents(c.children, depth + 1, excludeId));
  }
  return out;
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

@Component({
  selector: 'app-admin-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div class="ij-admin-form-wrap">
      <a [routerLink]="['/admin/categories']" class="ij-back-link">← Back to Categories</a>
      <h1 class="ij-admin-title">{{ isNew ? 'New Category' : 'Edit Category' }}</h1>
      @if (loading) {
        <div class="text-center py-5">Loading...</div>
      } @else {
        <div class="ij-admin-card">
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <div class="ij-form-grid">
              <div class="ij-field">
                <label for="name">Category Name</label>
                <input id="name" type="text" formControlName="name" [class.is-invalid]="isFieldInvalid('name')" required />
                @if (errorFor('name'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label for="slug">Slug</label>
                <input id="slug" type="text" formControlName="slug" [class.is-invalid]="isFieldInvalid('slug')" required />
                @if (errorFor('slug'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label for="parentCategoryId">Parent Category</label>
                <select id="parentCategoryId" formControlName="parentCategoryId">
                  <option [value]="null">(None — Top Level)</option>
                  @for (parent of parentOptions; track parent.id) {
                    <option [value]="parent.id">{{ parent.label }}</option>
                  }
                </select>
              </div>
              <div class="ij-field">
                <label for="displayOrder">Display Order</label>
                <input id="displayOrder" type="number" formControlName="displayOrder" [class.is-invalid]="isFieldInvalid('displayOrder')" min="0" required />
                @if (errorFor('displayOrder'); as msg) { <small class="ij-error">{{ msg }}</small> }
              </div>
              <div class="ij-field">
                <label for="isActive">Status</label>
                <select id="isActive" formControlName="isActive">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Hidden</option>
                </select>
              </div>
              <div class="ij-field ij-col-span-3">
                <label for="description">Description</label>
                <textarea id="description" rows="4" formControlName="description"></textarea>
              </div>
            </div>
            <div class="ij-actions">
              <button type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Saving...' : (isNew ? 'Create Category' : 'Save Changes') }}</button>
              <a [routerLink]="['/admin/categories']">Cancel</a>
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
    .ij-col-span-3 { grid-column: span 3; }
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
    .ij-actions { display: flex; gap: 10px; margin-top: 20px; }
    .ij-actions button { border: 0; background: #a8864c; color: #fff; padding: 10px 16px; border-radius: 8px; font-weight: 600; }
    .ij-actions a { border: 1px solid #d1d5db; color: #111827; text-decoration: none; padding: 10px 16px; border-radius: 8px; }
    @media (max-width: 992px) { .ij-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ij-col-span-3 { grid-column: span 2; } }
    @media (max-width: 640px) { .ij-form-grid { grid-template-columns: 1fr; } .ij-col-span-3 { grid-column: span 1; } }
  `],
})
export class AdminCategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AdminCategoryService);
  private readonly toast = inject(ToastService);

  isNew = true;
  private categoryId: number | null = null;
  loading = true;
  saving = false;
  parentOptions: ParentOption[] = [];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    slug: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(SLUG_PATTERN)]],
    parentCategoryId: [null as number | null],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    imageUrl: [''],
    isActive: [true],
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  errorFor(fieldName: 'name' | 'slug' | 'displayOrder'): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.invalid || !(field.touched || field.dirty)) return null;
    if (field.errors?.['required']) return `${this.prettyFieldName(fieldName)} is required.`;
    if (field.errors?.['maxlength']) return `${this.prettyFieldName(fieldName)} is too long.`;
    if (field.errors?.['pattern']) return 'Slug must use lowercase letters, numbers, and hyphens only.';
    if (field.errors?.['min']) return 'Display order must be zero or greater.';
    return 'Invalid value.';
  }

  private prettyFieldName(fieldName: 'name' | 'slug' | 'displayOrder'): string {
    if (fieldName === 'displayOrder') return 'Display order';
    return fieldName === 'name' ? 'Name' : 'Slug';
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = !idParam;
    this.categoryId = idParam ? +idParam : null;

    const tree$ = this.api.tree();
    if (this.isNew) {
      tree$.subscribe({
        next: (tree) => {
          this.parentOptions = flattenForParents(tree);
          this.loading = false;
        },
        error: () => {
          this.toast.error('Failed to load categories');
          this.loading = false;
        },
      });
      return;
    }

    forkJoin({ tree: tree$, cat: this.api.getById(this.categoryId!) })
      .pipe(
        catchError(() => {
          this.toast.error('Category not found');
          this.router.navigateByUrl('/admin/categories');
          return of(null);
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.parentOptions = flattenForParents(res.tree, 0, this.categoryId!);
        const c = res.cat;
        this.form.patchValue({
          name: c.name,
          slug: c.slug,
          parentCategoryId: c.parentCategoryId ?? null,
          displayOrder: c.displayOrder,
          description: c.description ?? '',
          imageUrl: c.imageUrl ?? '',
          isActive: c.isActive,
        });
        this.loading = false;
      });
  }

  save() {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const v = this.form.getRawValue();
    const body: SaveCategoryRequest = {
      name: (v.name ?? '').trim(),
      slug: (v.slug ?? '').trim().toLowerCase(),
      parentCategoryId: v.parentCategoryId,
      description: v.description?.trim() || null,
      displayOrder: Number(v.displayOrder) || 0,
      imageUrl: v.imageUrl?.trim() || null,
      isActive: v.isActive ?? true,
    };

    const req$ = this.isNew ? this.api.create(body) : this.api.update(this.categoryId!, body);
    req$.subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(this.isNew ? 'Created' : 'Saved');
        this.router.navigateByUrl('/admin/categories');
      },
      error: (e) => {
        this.saving = false;
        const msg = e?.error?.message ?? (Array.isArray(e?.error) ? e.error.join(', ') : e?.message) ?? 'Save failed';
        this.toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      },
    });
  }
}
