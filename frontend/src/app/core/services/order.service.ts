import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateOrderDto, OrderDetailDto } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  create(dto: CreateOrderDto) {
    return this.http.post<OrderDetailDto>(this.base, dto);
  }

  track(orderNumber: string) {
    return this.http.get<OrderDetailDto>(`${this.base}/track/${encodeURIComponent(orderNumber)}`);
  }
}
