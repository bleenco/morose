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

  isLoggedIn(): boolean {
    let token = localStorage.getItem('morose_token');
    return token ? true : false;
  }

  getToken(): string {
    return localStorage.getItem('morose_token');
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
      .then(data => data);
  }

  getUserDetails(username: string): any {
    return this.api.getUserDetails(username)
      .toPromise()
      .then(data => data);
  }

  addUser(username: string, password: string, fullname: string, email: string): any {
    return this.api.addUser(username, password, fullname, email)
      .toPromise()
      .then(data => data);
  }

  changePassword(oldpass: string, pass1: string, pass2: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (pass1 !== pass2) {
        reject(`New password doesn't match!`);
      }

      this.api.login(this.user.name, oldpass)
        .toPromise()
        .then(data => {
          if (data.auth && data.token) {
            this.api.changePassword(this.user.name, pass1)
            .toPromise()
            .then(() => resolve(true));
          } else {
            reject(`Current password is not correct!`);
          }
        });
    });
  }

  updateProfile(name: string, email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.updateProfile(this.user.name, name, email)
        .toPromise()
        .then(data => resolve(true));
    });
  }
}

export let AuthServiceProvider: Provider = {
  provide: AuthService, useClass: AuthService
};
