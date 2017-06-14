import { Injectable, Provider } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.authService.isLoggedIn()) {
        this.authService.getUserDetails(this.authService.user.name)
          .then(data => {
            if (data.role === 'admin') {
              resolve(true);
            } else {
              resolve(false);
            }
          }).catch(() => resolve(false));
      } else {
        resolve(false);
      }
    });
  }
}

export const AdminGuardProvider: Provider = {
  provide: AdminGuard, useClass: AdminGuard
};
