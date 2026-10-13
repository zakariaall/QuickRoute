import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface TokenResponse { access_token: string; expires_in: number; }
export interface AuthUser { id: string; name: string; email: string; initial: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenState = signal<string | null>(this.readValidToken());
  readonly token = this.tokenState.asReadonly();
  readonly user = computed<AuthUser | null>(() => {
    const token = this.tokenState();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const name = payload.name || payload.preferred_username || payload.email || 'Compte';
      return { id: String(payload.sub || ''), name, email: String(payload.email || ''), initial: String(name).charAt(0).toUpperCase(), roles: payload.realm_access?.roles || [] };
    } catch { return { id: '', name: 'Compte', email: '', initial: 'Q', roles: [] }; }
  });

  async initialize(): Promise<void> {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (!code || !url.pathname.endsWith('/auth/callback')) return;
    const returnTo = this.safeReturnPath(sessionStorage.getItem('quickroute_auth_return'));
    const state = sessionStorage.getItem('quickroute_oauth_state');
    const verifier = sessionStorage.getItem('quickroute_pkce_verifier');
    if (!state || !verifier || url.searchParams.get('state') !== state) {
      history.replaceState({}, '', `${returnTo}?connexion=échouée`);
      sessionStorage.removeItem('quickroute_auth_return');
      return;
    }
    const form = new URLSearchParams({ grant_type: 'authorization_code', client_id: environment.keycloak.clientId,
      code, redirect_uri: `${location.origin}/auth/callback`, code_verifier: verifier });
    try {
      const token = await firstValueFrom(this.http.post<TokenResponse>(`${environment.keycloak.issuer}/protocol/openid-connect/token`, form.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }));
      this.tokenState.set(token.access_token);
      sessionStorage.setItem('quickroute_access_token', token.access_token);
      sessionStorage.setItem('quickroute_token_expiry', String(Date.now() + token.expires_in * 1000));
      history.replaceState({}, '', returnTo);
    } catch {
      history.replaceState({}, '', `${returnTo}?connexion=échouée`);
    } finally {
      sessionStorage.removeItem('quickroute_oauth_state');
      sessionStorage.removeItem('quickroute_pkce_verifier');
      sessionStorage.removeItem('quickroute_auth_return');
    }
  }

  async login(returnTo = '/restaurants'): Promise<void> {
    await this.authorize(returnTo, false);
  }

  async register(returnTo = '/register'): Promise<void> {
    await this.authorize(returnTo, true);
  }

  private async authorize(returnTo: string, register: boolean): Promise<void> {
    const verifier = this.randomString(64);
    const state = this.randomString(32);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    sessionStorage.setItem('quickroute_pkce_verifier', verifier);
    sessionStorage.setItem('quickroute_oauth_state', state);
    sessionStorage.setItem('quickroute_auth_return', this.safeReturnPath(returnTo));
    const params = new URLSearchParams({ client_id: environment.keycloak.clientId, redirect_uri: `${location.origin}/auth/callback`, response_type: 'code', scope: 'openid profile email', state, code_challenge: challenge, code_challenge_method: 'S256' });
    const flow = register ? 'registrations' : 'auth';
    location.assign(`${environment.keycloak.issuer}/protocol/openid-connect/${flow}?${params}`);
  }

  logout(): void {
    this.tokenState.set(null);
    sessionStorage.removeItem('quickroute_access_token');
    sessionStorage.removeItem('quickroute_token_expiry');
    const params = new URLSearchParams({ client_id: environment.keycloak.clientId, post_logout_redirect_uri: `${location.origin}/restaurants` });
    location.assign(`${environment.keycloak.issuer}/protocol/openid-connect/logout?${params}`);
  }

  private randomString(length: number): string {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private safeReturnPath(path: string | null): string {
    return path?.startsWith('/') && !path.startsWith('//') ? path : '/restaurants';
  }

  private readValidToken(): string | null {
    const token = sessionStorage.getItem('quickroute_access_token');
    const expiry = Number(sessionStorage.getItem('quickroute_token_expiry') || 0);
    if (token && expiry > Date.now()) return token;
    sessionStorage.removeItem('quickroute_access_token');
    sessionStorage.removeItem('quickroute_token_expiry');
    return null;
  }
}
