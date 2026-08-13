import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, from, switchMap, throwError, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing: Promise<string | null> | null = null;

  constructor(private auth: AuthService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.auth.accessToken;
    const authReq =
      token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (
          err.status === 401 &&
          !req.url.includes('/auth/login') &&
          !req.url.includes('/auth/refresh')
        ) {
          if (!this.refreshing) {
            this.refreshing = this.auth.refresh().finally(() => {
              this.refreshing = null;
            });
          }
          return from(this.refreshing).pipe(
            switchMap((newToken) => {
              if (!newToken) return throwError(() => err);
              return next.handle(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
              );
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
