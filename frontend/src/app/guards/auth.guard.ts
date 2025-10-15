import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Not logged in → send to login with returnUrl
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login-34475338'], { queryParams: { returnUrl: state.url } });
  }
  // Authorized → allow through
  return true;
};
