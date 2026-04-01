import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CategoryDto, PagedResultDto, ProductListDto } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  private readonly treeShared$ = this.http.get<CategoryDto[]>(this.base).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  activeTree() {
    return this.treeShared$;
  }

  bySlug(slug: string) {
    return this.http.get<CategoryDto>(`${this.base}/${encodeURIComponent(slug)}`);
  }

  productsBySlug(
    slug: string,
    params: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: string;
      minPrice?: number;
      maxPrice?: number;
      isOnSale?: boolean;
    } = {}
  ) {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('pageSize', String(params.pageSize ?? 12));
    if (params.sortBy != null && params.sortBy !== '') {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder != null && params.sortOrder !== '') {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.minPrice != null) {
      httpParams = httpParams.set('minPrice', String(params.minPrice));
    }
    if (params.maxPrice != null) {
      httpParams = httpParams.set('maxPrice', String(params.maxPrice));
    }
    if (params.isOnSale != null) {
      httpParams = httpParams.set('isOnSale', String(params.isOnSale));
    }
    return this.http.get<PagedResultDto<ProductListDto>>(`${this.base}/${encodeURIComponent(slug)}/products`, {
      params: httpParams,
    });
  }

  /** @deprecated Prefer productsBySlug for storefront routes */
  products(
    categoryId: number,
    params: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: string;
      minPrice?: number;
      maxPrice?: number;
      isOnSale?: boolean;
    } = {}
  ) {
    return this.http.get<PagedResultDto<ProductListDto>>(`${this.base}/${categoryId}/products`, {
      params: { ...params } as Record<string, string | number | boolean>,
    });
  }
}
