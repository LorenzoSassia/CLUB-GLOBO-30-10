import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacionService } from '../services/autenticacion.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AutenticacionService);
  const authToken = authService.getToken();

  // Clone the request and add the authorization header if the token exists
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  // If no token, pass the original request
  return next(req);
};
