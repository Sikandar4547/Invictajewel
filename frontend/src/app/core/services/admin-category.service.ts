import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CategoryDto, SaveCategoryRequest } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/categories`;

  tree() {
    return this.http.get<CategoryDto[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<CategoryDto>(`${this.base}/${id}`);
  }

  create(body: SaveCategoryRequest) {
    return this.http.post<CategoryDto>(this.base, body);
  }

  update(id: number, body: SaveCategoryRequest) {
    return this.http.put<CategoryDto>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleStatus(id: number) {
    return this.http.patch<void>(`${this.base}/${id}/toggle-status`, {});
  }
}
