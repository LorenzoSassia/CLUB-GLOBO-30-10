// src/app/guards/auth.guard.ts
/*import { inject } from '@angular/core';
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
  console.log('Rol del usuario:', rolUsuario);
  console.log('Roles permitidos en la ruta:', rolesRuta);

  if (rolesRuta && rolUsuario && !rolesRuta.includes(rolUsuario)) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  return true;
};*/

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/autenticacion.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si está logueado
  if (!auth.estaLogueado()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Obtener el rol esperado de la ruta
  // Usamos 'rol' (singular) porque así está en tu app.routes.ts
  const rolRequerido = route.data['rol'] as string;
  
  // 3. Obtener el rol real del usuario
  const rolUsuario = auth.getRol();

  // 4. Comparar
  // Si la ruta no pide rol, o si los roles coinciden (ignorando mayúsculas), pasa.
  if (!rolRequerido || (rolUsuario && rolUsuario.toLowerCase() === rolRequerido.toLowerCase())) {
    return true;
  }

  // 5. Si falla, redirigir a inicio
  console.warn(`Acceso denegado. Usuario: ${rolUsuario}, Requerido: ${rolRequerido}`);
  router.navigate(['/invitado']);
  return false;
};
