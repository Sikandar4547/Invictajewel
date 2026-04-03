import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concat,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { CategoryDto, PagedResultDto, ProductListDto } from '../../models/api.types';
import { findCategoryPath } from '../../core/utils/category-tree.util';

type CategoryPageState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; category: CategoryDto; products: PagedResultDto<ProductListDto>; breadcrumb: CategoryDto[] };

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink, MatButtonModule, MatSelectModule, MatFormFieldModule, FormsModule, ProductCardComponent],
  templateUrl: './category-page.component.html',
})
export class CategoryPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CategoryService);

  readonly page$ = new BehaviorSubject(1);
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'name' = 'newest';
  private readonly sort$ = new BehaviorSubject<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');

  private readonly slug$ = this.route.paramMap.pipe(
    map((pm) => pm.get('slug') ?? ''),
    distinctUntilChanged(),
    tap(() => this.page$.next(1))
  );

  readonly state$ = combineLatest([this.slug$, this.page$, this.sort$]).pipe(
    switchMap(([slug, page, sort]) => {
      if (!slug) {
        return of<CategoryPageState>({ kind: 'error' });
      }
      const sp = this.toApiSort(sort);
      return concat(
        of<CategoryPageState>({ kind: 'loading' }),
        forkJoin({
          category: this.api.bySlug(slug),
          products: this.api.productsBySlug(slug, {
            page,
            pageSize: 12,
            sortBy: sp.sortBy,
            sortOrder: sp.sortOrder,
          }),
          tree: this.api.activeTree().pipe(take(1)),
        }).pipe(
          map(({ category, products, tree }) => {
            const breadcrumb = findCategoryPath(tree, slug) ?? [category];
            return {
              kind: 'ready' as const,
              category,
              products,
              breadcrumb,
            };
          }),
          catchError(() => of<CategoryPageState>({ kind: 'error' }))
        )
      );
    })
  );

  onSortChange() {
    this.sort$.next(this.sortBy);
    this.page$.next(1);
  }

  prev() {
    this.page$.next(Math.max(1, this.page$.value - 1));
  }

  next(totalPages: number) {
    this.page$.next(Math.min(totalPages, this.page$.value + 1));
  }

  goToPage(n: number) {
    this.page$.next(n);
  }

  pageButtonList(totalPages: number, current: number): (number | null)[] {
    if (totalPages <= 1) {
      return [];
    }
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);
    for (let i = current - 1; i <= current + 1; i++) {
      if (i >= 1 && i <= totalPages) {
        set.add(i);
      }
    }
    const sorted = [...set].sort((a, b) => a - b);
    const out: (number | null)[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev > 0 && p > prev + 1) {
        out.push(null);
      }
      out.push(p);
      prev = p;
    }
    return out;
  }

  private toApiSort(sort: string) {
    switch (sort) {
      case 'price-asc':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'price-desc':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'name':
        return { sortBy: 'name', sortOrder: 'asc' };
      default:
        return { sortBy: 'newest', sortOrder: 'desc' };
    }
  }
}
