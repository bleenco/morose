import { Injectable, Provider, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { JwtHelper } from 'angular2-jwt';
import { ChangePasswordForm } from '../components/app-user-profile/app-user-profile.component';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper;
  user: any;
  userDetails: any;
  loginStatus: EventEmitter<boolean>;
  userDetailsUpdated: EventEmitter<null>;

  constructor(private api: ApiService, private router: Router) {
    this.jwtHelper = new JwtHelper();
    this.loginStatus = new EventEmitter<boolean>();
    this.userDetailsUpdated = new EventEmitter<null>();
    this.userDetails = {};

    this.loginStatus.subscribe(event => {
      if (event) {
        this.updateUserDetails();
      } else {
        this.userDetails = {};
      }
    });
  }

  updateUserDetails(): void {
    let user = this.getUser();
    this.getUserDetails(user.name).then(data => {
      this.userDetails = data;
      this.userDetails.avatar = this.api.uri + data.avatar;
      this.userDetailsUpdated.emit(null);
    });
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

  getUser(): any {
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

  getUsers(): any {
    return this.api.getUsers()
      .toPromise()
      .then(data => data);
  }

  addUser(username: string, password: string, fullname: string, email: string): any {
    return this.api.addUser(username, password, fullname, email)
      .toPromise()
      .then(data => data);
  }

  addOrganization(name: string): any {
    return this.api.addOrganization(name, this.user.name)
      .toPromise()
      .then(data => data);
  }

  addUserToOrganization(user: string, organization: string, role: string): any {
    return this.api.addUserToOrganization(user, organization, role)
      .toPromise()
      .then(data => data);
  }

  addUserToTeam(user: string, team: string, organization: string): any {
    return this.api.addUserToTeam(user, team, organization)
      .toPromise()
      .then(data => data);
  }

  addTeam(team: string, organization: string): any {
    return this.api.addTeam(team, organization, this.user.name)
      .toPromise()
      .then(data => data);
  }

  deleteOrganization(name: string): any {
    return this.api.deleteOrganization(name)
      .toPromise()
      .then(data => data);
  }

  deleteTeam(name: string, organization: string): any {
    return this.api.deleteTeam(name, organization)
      .toPromise()
      .then(data => data);
  }

  deleteUser(name: string): any {
    return this.api.deleteUser(name)
      .toPromise()
      .then(data => data);
  }

  deleteUserFromTeam(name: string, team: string, organization: string): any {
    return this.api.deleteUserFromTeam(name, team, organization)
      .toPromise()
      .then(data => data);
  }

  deleteUserFromOrganization(name: string, organization: string): any {
    return this.api.deleteUserFromOrganization(name, organization)
      .toPromise()
      .then(data => data);
  }

  changePassword(passwords: ChangePasswordForm): Promise<any> {
    return new Promise((resolve, reject) => {
      if (passwords.newpassword1 !== passwords.newpassword2) {
        reject(`New password doesn't match!`);
      }

      this.api.login(this.user.name, passwords.oldpassword)
        .toPromise()
        .then(data => {
          if (data.auth && data.token) {
            this.api.changePassword(this.user.name, passwords.newpassword1)
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
