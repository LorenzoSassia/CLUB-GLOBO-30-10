
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { Rol } from '../models/models';

export const autenticacionGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);
  const rolRequerido = route.data['rol'] as Rol;

  if (autenticacionService.estaAutenticado()) {
    if (rolRequerido && !autenticacionService.tieneRol(rolRequerido)) {
      // Usuario autenticado pero sin el rol correcto, redirigir a una página de acceso denegado o a su dashboard
      router.navigate(['/invitado']); // O una página específica de "acceso denegado"
      return false;
    }
    return true; // Usuario autenticado y con el rol correcto (o no se requiere rol específico)
  }

  // Usuario no autenticado, redirigir a login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
