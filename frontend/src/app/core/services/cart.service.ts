import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartDto } from '../../models/api.types';
import { getOrCreateCartId } from './cart-id.storage';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cart`;
  private readonly summary$ = new BehaviorSubject<CartDto | null>(null);

  readonly cartChanges = this.summary$.asObservable();

  refresh() {
    const id = getOrCreateCartId();
    return this.http.get<CartDto>(`${this.base}/${id}`).pipe(
      catchError(() =>
        of({
          cartIdentifier: id,
          items: [],
          subtotal: 0,
          total: 0,
          totalQuantity: 0,
        } as CartDto)
      ),
      tap((c) => this.summary$.next(c))
    );
  }

  ensureServerCart() {
    return this.refresh();
  }

  addItem(productId: number, quantity = 1) {
    const body = { cartIdentifier: getOrCreateCartId(), productId, quantity };
    return this.http.post<CartDto>(`${this.base}/items`, body).pipe(tap((c) => this.summary$.next(c)));
  }

  updateItem(itemId: number, quantity: number) {
    return this.http.put<CartDto>(`${this.base}/items/${itemId}`, { quantity }).pipe(tap((c) => this.summary$.next(c)));
  }

  removeItem(itemId: number) {
    return this.http.delete<CartDto>(`${this.base}/items/${itemId}`).pipe(tap((c) => this.summary$.next(c)));
  }

  snapshot(): CartDto | null {
    return this.summary$.value;
  }
}
