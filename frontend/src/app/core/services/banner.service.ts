import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BannerDto } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/banners`;

  active() {
    return this.http.get<BannerDto[]>(this.base);
  }
}

