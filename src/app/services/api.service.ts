import { Injectable, Provider } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  url: string;

  constructor(private http: Http) {
    let loc: Location = window.location;
    let port: string = loc.port === '8000' ? ':10000' : `:${loc.port}`; // dev mode
    this.url = `${loc.protocol}//${loc.hostname}${port}/api`;
  }

  getRandomPackages(username: string): Observable<any[]> {
    return this.post(`${this.url}/package/get-random`, { username });
  }

  getPackage(pkgName: string, username: string): Observable<any[]> {
    return this.post(`${this.url}/package/${pkgName}`, { username });
  }

  getPackagesByKeyword(keyword: string, username: string): Observable<any[]> {
    return this.post(`${this.url}/package/search`, { keyword, username });
  }

  getOrganizations(username: string): Observable<any[]> {
    return this.post(`${this.url}/user/organizations`, { username });
  }

  login(username: string, password: string): Observable<any> {
    let user = { username, password };

    return this.post(`${this.url}/user/login`, user);
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
}

export let ApiServiceProvider: Provider = {
  provide: ApiService, useClass: ApiService
};
