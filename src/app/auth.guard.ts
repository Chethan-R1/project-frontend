import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  if (userId && userName) {
    return true;
  } else {
    // ✅ Only store redirect if this is not already login page
    if (state.url.startsWith('/room/')) {
      localStorage.setItem('redirectAfterLogin', state.url);
    }
    router.navigate(['/login']);
    return false;
  }
};
