import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule, Http, RequestOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { ApiServiceProvider } from './services/api.service';
import { AuthServiceProvider } from './services/auth.service';
import { AppComponent } from './app.component';
import { AppNavComponent } from './components/app-nav';
import { AppFootComponent } from './components/app-foot';
import { AppLoginComponent } from './components/app-login';
import { AppLandingComponent } from './components/app-landing';
import { AppStatsComponent } from './components/app-stats';
import { AppLineChartComponent } from './components/app-line-chart';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    tokenName: 'morose_token',
    tokenGetter: (() => localStorage.getItem('morose_token')),
    globalHeaders: [{'Content-Type': 'application/json'}]
  }), http, options);
}

@NgModule({
  declarations: [
    AppComponent,
    AppNavComponent,
    AppFootComponent,
    AppLoginComponent,
    AppLandingComponent,
    AppStatsComponent,
    AppLineChartComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: AppLandingComponent },
      { path: 'user/login', component: AppLoginComponent },
      { path: 'statistics', component: AppStatsComponent }
    ]),
    HttpModule,
    FormsModule
  ],
  providers: [
    ApiServiceProvider,
    AuthServiceProvider,
    { provide: AuthHttp, useFactory: authHttpServiceFactory, deps: [Http, RequestOptions] }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
