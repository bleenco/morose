import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper;
  loggedIn: boolean;

  constructor(private api: ApiService) {
    this.jwtHelper = new JwtHelper();
  }

  isLoggedIn(): boolean {
    let token = localStorage.getItem('morose_token');

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }

    return this.loggedIn;
  }


}
