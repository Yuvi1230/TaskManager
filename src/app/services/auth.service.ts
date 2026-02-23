import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { LoginResult, RegisterPayload, RegisterResult, StoredUser } from '../auth/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenStorageKey = 'taskflow_jwt_token';
  private readonly usersStorageKey = 'taskflow_users';
  private readonly isAuthenticatedSignal = signal(false);

  constructor() {
    if (this.isBrowser()) {
      this.isAuthenticatedSignal.set(!!localStorage.getItem(this.tokenStorageKey));
    }
  }

  isAuthenticated() {
    if (!this.isBrowser()) {
      return false;
    }

    const token = localStorage.getItem(this.tokenStorageKey);
    if (!token) {
      return false;
    }

    return !this.isTokenExpired(token);
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem(this.tokenStorageKey);
  }

  getCurrentUserEmail(): string | null {
    const payload = this.parseTokenPayload(this.getToken());
    return typeof payload?.['sub'] === 'string' ? (payload['sub'] as string) : null;
  }

  register(payload: RegisterPayload): RegisterResult {
    if (!this.isBrowser()) {
      return { success: false, message: 'Registration is unavailable in this environment.' };
    }

    const users = this.getStoredUsers();
    const normalizedEmail = payload.email.trim().toLowerCase();

    const duplicateUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);
    if (duplicateUser) {
      return { success: false, message: 'Email is already registered. Please use another email.' };
    }

    users.push({
      fullName: payload.fullName.trim(),
      email: normalizedEmail,
      password: payload.password
    });
    localStorage.setItem(this.usersStorageKey, JSON.stringify(users));

    return { success: true };
  }

  login(email: string, password: string): LoginResult {
    if (!this.isBrowser()) {
      return { success: false, message: 'Login is unavailable in this environment.' };
    }

    const users = this.getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
    );

    if (!matchedUser) {
      return {
        success: false,
        message: 'Invalid email or password. Please try again.'
      };
    }

    const token = this.generateMockJwt(matchedUser.email, matchedUser.fullName);
    localStorage.setItem(this.tokenStorageKey, token);
    this.isAuthenticatedSignal.set(true);

    return { success: true, token };
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(this.tokenStorageKey);
    this.isAuthenticatedSignal.set(false);
  }

  private getStoredUsers(): StoredUser[] {
    if (!this.isBrowser()) {
      return [];
    }

    const storedUsers = localStorage.getItem(this.usersStorageKey);
    if (!storedUsers) {
      return [];
    }

    try {
      return JSON.parse(storedUsers) as StoredUser[];
    } catch {
      return [];
    }
  }

  private generateMockJwt(email: string, fullName: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: email,
        name: fullName,
        iat: now,
        exp: now + 24 * 60 * 60
      })
    );
    const signature = btoa('taskflow-signature');

    return `${header}.${payload}.${signature}`;
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
