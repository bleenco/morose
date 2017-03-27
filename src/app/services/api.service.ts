import { Injectable, Provider } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  url: string;

  constructor(private http: Http) {
    let loc: Location = window.location;
    let port: string = loc.port === '8000' ? ':10000' : `:${loc.port}`; // dev mode
    this.url = `${loc.protocol}//${loc.hostname}${port}/api`;
  }

  getRandomPackages(): Observable<any[]> {
    return this.get(`${this.url}/package/get-random`);
  }

  getPackagesByKeyword(keyword: string): Observable<any[]> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('keyword', keyword);

    return this.get(`${this.url}/package/search`, params);
  }

  private get(url: string, searchParams: URLSearchParams = null): Observable<any> {
    return this.http.get(url, { search: searchParams })
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
