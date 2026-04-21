import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OrderDetailDto, PagedResultDto } from '../../models/api.types';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  list(params: { page?: number; pageSize?: number; incompleteOnly?: boolean } = {}) {
    return this.http.get<PagedResultDto<OrderDetailDto>>(this.base, { params: { ...params } as Record<string, string | number | boolean> });
  }

  getIncompleteCount() {
    return this.http.get<{ count: number }>(`${this.base}/incomplete-count`);
  }

  markComplete(orderId: number) {
    return this.http.put<void>(`${this.base}/${orderId}/status`, { status: 'Delivered' });
  }
}

