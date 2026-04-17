import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const ACCESS_TOKEN_KEY = 'invicta_admin_jwt';
const REFRESH_TOKEN_KEY = 'invicta_admin_refresh_token';

interface AuthResponse {
  token: string;
  tokenType?: string;
  refreshToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  getStoredToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getStoredRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  setTokens(token: string, refreshToken?: string | null): void {
    this.setToken(token);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  clearToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password });
  }

  refreshAccessToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/refresh`, { refreshToken });
  }

  logout(): void {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !this.isTokenExpired(this.getStoredToken());
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = this.parseJwtPayload(token);
      const exp = Number(payload?.['exp']);
      if (!Number.isFinite(exp)) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  private parseJwtPayload(token: string): Record<string, unknown> {
    const [, payload] = token.split('.');
    if (!payload) throw new Error('Invalid JWT');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  }
}
