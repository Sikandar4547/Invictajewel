import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PagedResultDto, ProductDetailDto, ProductListDto, SaveProductRequest } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/products`;

  list(params: { page?: number; pageSize?: number; search?: string; categoryId?: number } = {}) {
    return this.http.get<PagedResultDto<ProductListDto>>(this.base, { params: { ...params } as Record<string, string | number> });
  }

  getById(id: number) {
    return this.http.get<ProductDetailDto>(`${this.base}/${id}`);
  }

  create(body: SaveProductRequest) {
    return this.http.post<ProductDetailDto>(this.base, body);
  }

  update(id: number, body: SaveProductRequest) {
    return this.http.put<ProductDetailDto>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleStatus(id: number) {
    return this.http.patch<void>(`${this.base}/${id}/toggle-status`, {});
  }

  /** Replaces all product images with the uploaded file. */
  uploadImage(productId: number, file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<{ imageUrl: string }>(`${this.base}/${productId}/image`, fd);
  }
}
