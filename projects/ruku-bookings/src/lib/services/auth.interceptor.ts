import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { LIB_ENVIRONMENT } from '../environment/environment.token';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only attach token to API requests
  const env = inject(LIB_ENVIRONMENT);
  if (!req.url.startsWith(env.apiBaseUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);

  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem('auth_token')
    : null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    tap({
      error: (error) => {
        // Skip logout for login/register requests to avoid redirect loop
        if (error.status === 401 && !req.url.includes('/auth/')) {
          authService.logout();
        }
      }
    })
  );
};
