import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  saveToken(token: string): void {
    localStorage.setItem('auth-token', token);
  }

  logout(): void {
    localStorage.removeItem('auth-token');
  }
}
