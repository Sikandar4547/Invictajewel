import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PagedResultDto, ProductDetailDto, ProductListDto } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  search(params: {
    categoryId?: number;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: number;
    maxPrice?: number;
    isOnSale?: boolean;
  } = {}) {
    return this.http.get<PagedResultDto<ProductListDto>>(this.base, { params: { ...params } as Record<string, string | number | boolean> });
  }

  bySlug(slug: string) {
    return this.http.get<ProductDetailDto>(`${this.base}/by-slug/${encodeURIComponent(slug)}`);
  }

  featured(take = 8) {
    return this.http.get<ProductListDto[]>(`${this.base}/featured`, { params: { take } });
  }

  newArrivals(take = 8) {
    return this.http.get<ProductListDto[]>(`${this.base}/new-arrivals`, { params: { take } });
  }
}
