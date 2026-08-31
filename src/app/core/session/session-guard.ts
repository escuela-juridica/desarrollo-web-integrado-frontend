import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from './session';

/** Protege las rutas bajo /app (PF-008, PF-009). Sin sesion, redirige a PF-003. */
export const sessionGuard: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);

  if (session.estaAutenticado()) {
    return true;
  }

  return router.parseUrl('/acceso');
};
