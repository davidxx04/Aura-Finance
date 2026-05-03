import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

export const authGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  await authStore.init();

  if (authStore.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/app/dashboard']);
};