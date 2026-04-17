import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BannerDto, SaveBannerRequest } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class AdminBannerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/banners`;

  list() {
    return this.http.get<BannerDto[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<BannerDto>(`${this.base}/${id}`);
  }

  create(body: SaveBannerRequest) {
    return this.http.post<BannerDto>(this.base, body);
  }

  update(id: number, body: SaveBannerRequest) {
    return this.http.put<BannerDto>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadImage(file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<{ imageUrl: string }>(`${this.base}/upload-image`, fd);
  }
}
