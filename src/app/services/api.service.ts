import { Injectable, Provider } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  url: string;
  uri: string;

  constructor(private http: Http) {
    let loc: Location = window.location;
    let port: string = loc.port === '8000' ? ':10000' : `:${loc.port}`; // dev mode
    this.uri = `${loc.protocol}//${loc.hostname}${port}`;
    this.url = `${loc.protocol}//${loc.hostname}${port}/api`;
  }

  getRandomPackages(token: string | null): Observable<any[]> {
    let params: URLSearchParams = new URLSearchParams();
    if (token) {
      params.set('token', token);
    }

    return this.get(`${this.url}/package/get-random`, params);
  }

  getPackage(pkgName: string): Observable<any[]> {
    return this.get(`${this.url}/package/${pkgName}`);
  }

  getPackagesByKeyword(keyword: string): Observable<any[]> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('keyword', keyword);

    return this.get(`${this.url}/package/search`, params);
  }

  getUserProfile(username: string): Observable<any[]> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('username', username);

    return this.get(`${this.url}/user/profile`, params);
  }

  getCompanyProfile(organization: string): Observable<any[]> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('organization', organization);

    return this.get(`${this.url}/org/profile`, params);
  }

  getTeamProfile(organization: string, team: string): Observable<any[]> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('organization', organization);
    params.set('team', team);

    return this.get(`${this.url}/org/team/profile`, params);
  }

  getOrganizations(username: string): Observable<any[]> {
    return this.post(`${this.url}/user/organizations`, { username });
  }

  getUserDetails(username: string): Observable<any[]> {
    return this.post(`${this.url}/user/details`, { username });
  }

  addUser(name: string, password: string, fullName: string, email: string): Observable<any[]> {
    return this.post(`${this.url}/user/add`, { name, password, fullName, email });
  }

  addOrganization(name: string, username: string): Observable<any[]> {
    return this.post(`${this.url}/org/add`, { name, username });
  }

  login(username: string, password: string): Observable<any> {
    let user = { username, password };

    return this.post(`${this.url}/user/login`, user);
  }

  changePassword(username: string, password: string): Observable<any> {
    let user = { username, password };

    return this.post(`${this.url}/user/change-password`, user);
  }

  updateProfile(username: string, name: string, email: string): Observable<any> {
    let user = { username, name, email };

    return this.post(`${this.url}/user/update-profile`, user);
  }

  private get(url: string, searchParams: URLSearchParams = null): Observable<any> {
    return this.http.get(url, { search: searchParams })
      .map(this.extractData)
      .catch(this.handleError);
  }

  private post(url: string, data: any): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(url, data, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  public encodeUrl(url: string) {
    return encodeURIComponent(url);
  }
}

export let ApiServiceProvider: Provider = {
  provide: ApiService, useClass: ApiService
};
