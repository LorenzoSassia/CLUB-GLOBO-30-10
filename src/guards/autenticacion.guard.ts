// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/autenticacion.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaLogueado()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificamos roles si la ruta los define
  const rolesRuta = route.data?.['roles'] as string[] | undefined;
  const rolUsuario = auth.getRol();

  if (rolesRuta && rolUsuario && !rolesRuta.includes(rolUsuario)) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  return true;
};
