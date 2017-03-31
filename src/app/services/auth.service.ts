import { Injectable, Provider } from '@angular/core';
import { ApiService } from './api.service';
import { JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper;

  constructor(private api: ApiService) {
    this.jwtHelper = new JwtHelper();
  }

  isLoggedIn(): boolean {
    let token = localStorage.getItem('morose_token');
    return (token && !this.jwtHelper.isTokenExpired(token)) ? true : false;
  }

  login(username: string, password: string): Promise<boolean> {
    return this.api.login(username, password)
      .toPromise()
      .then(data => {
        if (data.auth && data.token) {
          localStorage.setItem('morose_token', data.token);
          return true;
        } else {
          return false;
        }
      });
  }
}

export let AuthServiceProvider: Provider = {
  provide: AuthService, useClass: AuthService
};
