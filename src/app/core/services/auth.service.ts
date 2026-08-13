import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; mustChangePassword?: boolean };
  clinic: { id: string; slug: string; name: string };
  membership: { id: string; role: string; username: string };
}

const ACCESS_KEY = 'huda_medical_access';
const REFRESH_KEY = 'huda_medical_refresh';
const SESSION_KEY = 'huda_medical_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiBaseUrl}/api/v1`;
  private session$ = new BehaviorSubject<AuthSession | null>(this.loadSession());

  /** Signal mirror of the session stream, for template-driven shell state. */
  readonly sessionState = signal<AuthSession | null>(this.session$.value);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  get session(): AuthSession | null {
    return this.session$.value;
  }

  get isLoggedIn(): boolean {
    return !!this.session?.accessToken;
  }

  get projectId(): string {
    return this.session?.clinic?.slug ?? '';
  }

  get accessToken(): string | null {
    return this.session?.accessToken ?? localStorage.getItem(ACCESS_KEY);
  }

  watch() {
    return this.session$.asObservable();
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const res = await firstValueFrom(
      this.http.post<{ data: AuthSession }>(`${this.api}/auth/login`, {
        email,
        password,
      })
    );
    const session = res.data;
    this.persist(session);
    return session;
  }

  async refresh(): Promise<string | null> {
    const refresh =
      this.session?.refreshToken ?? localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    try {
      const res = await firstValueFrom(
        this.http.post<{ data: { accessToken: string; refreshToken?: string } }>(
          `${this.api}/auth/refresh`,
          { refreshToken: refresh }
        )
      );
      const cur = this.session;
      if (!cur) return null;
      const next: AuthSession = {
        ...cur,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken ?? cur.refreshToken,
      };
      this.persist(next);
      return next.accessToken;
    } catch {
      this.clear();
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await firstValueFrom(
          this.http.post(`${this.api}/auth/logout`, {
            refreshToken: this.session?.refreshToken,
          })
        );
      }
    } catch {
      /* ignore */
    }
    this.clear();
    await this.router.navigateByUrl('/login');
  }

  private persist(session: AuthSession) {
    localStorage.setItem(ACCESS_KEY, session.accessToken);
    localStorage.setItem(REFRESH_KEY, session.refreshToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.session$.next(session);
    this.sessionState.set(session);
  }

  private clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.session$.next(null);
    this.sessionState.set(null);
  }

  private loadSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }
}
