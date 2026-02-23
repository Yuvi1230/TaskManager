import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.constants';
import { AuthResponse, RegisterPayload, RegisterResponse } from '../auth/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly tokenStorageKey = 'taskflow_jwt_token';

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_BASE_URL}/api/auth/register`, payload);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return new Observable<AuthResponse>((observer) => {
      this.http
        .post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, { email, password })
        .subscribe({
          next: (response) => {
            if (this.isBrowser()) {
              localStorage.setItem(this.tokenStorageKey, response.token);
            }
            observer.next(response);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(this.tokenStorageKey);
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem(this.tokenStorageKey);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    const token = this.getToken();
    if (!token) {
      return false;
    }

    return !this.isTokenExpired(token);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private parseTokenPayload(token: string | null): Record<string, unknown> | null {
    if (!token) {
      return null;
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    try {
      return JSON.parse(atob(tokenParts[1])) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.parseTokenPayload(token);
    const expiry = payload?.['exp'];

    if (typeof expiry !== 'number') {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return now >= expiry;
  }
}
