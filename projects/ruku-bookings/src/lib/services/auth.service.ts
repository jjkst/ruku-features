import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { LIB_ENVIRONMENT } from '../environment/environment.token';

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  uid: string;
}

export interface RegisterRequest {
  email: string;
  uid: string;
  displayName: string;
  emailVerified: boolean;
  provider: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private env = inject(LIB_ENVIRONMENT);
  private readonly apiUrl = inject(LIB_ENVIRONMENT).apiBaseUrl;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  private userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  async login(email: string, uid: string): Promise<AuthResponse> {
    const body: LoginRequest = { email, uid };
    const response = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, body, { observe: 'response' })
    );
    if (response.body) {
      this.storeAuth(response.body);
    }
    return response.body!;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request, { observe: 'response' })
    );
    if (response.body) {
      this.storeAuth(response.body);
    }
    return response.body!;
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/google`, { credential }, { observe: 'response' })
    );
    if (response.body) {
      this.storeAuth(response.body);
    }
    return response.body!;
  }

  async githubLogin(code: string): Promise<AuthResponse> {
    const response = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/github`, { code }, { observe: 'response' })
    );
    if (response.body) {
      this.storeAuth(response.body);
    }
    return response.body!;
  }

  getGitHubAuthUrl(): string {
    const clientId = this.env.githubClientId;
    const redirectUri = this.env.githubRedirectUri;
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  }

  getUserRole(): string | null {
    return this.currentUser?.role ?? null;
  }

  private storeAuth(auth: AuthResponse): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.tokenKey, auth.token);
    localStorage.setItem(this.userKey, JSON.stringify(auth.user));
    this.userSubject.next(auth.user);
  }

  private getStoredUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(this.userKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
