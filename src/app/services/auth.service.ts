import { Injectable, Provider, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper;
  user: any;
  loginStatus: EventEmitter<boolean>;

  constructor(private api: ApiService, private router: Router) {
    this.jwtHelper = new JwtHelper();
    this.loginStatus = new EventEmitter<boolean>();
  }

  checkLogin(): void {
    let token = localStorage.getItem('morose_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.user = this.getUser();
      this.loginStatus.emit(true);
    } else {
      this.user = null;
      this.loginStatus.emit(false);
    }
  }

  getUser(): void {
    return this.jwtHelper.decodeToken(localStorage.getItem('morose_token'));
  }

  login(username: string, password: string): Promise<boolean> {
    return this.api.login(username, password)
      .toPromise()
      .then(data => {
        if (data.auth && data.token) {
          localStorage.setItem('morose_token', data.token);
          this.checkLogin();
          return true;
        } else {
          return false;
        }
      });
  }

  logout(): void {
    localStorage.removeItem('morose_token');
    this.checkLogin();
    this.router.navigate(['user/login']);
  }

  getUserOrganizations(username: string): any {
    return this.api.getOrganizations(username)
      .toPromise()
      .then(data => {
        return data;
      })
  }
}

export let AuthServiceProvider: Provider = {
  provide: AuthService, useClass: AuthService
};
