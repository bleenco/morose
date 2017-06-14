import { Injectable, Provider } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/combineLatest';

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
