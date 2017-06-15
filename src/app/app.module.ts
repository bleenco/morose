import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule, Http, RequestOptions } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { NgUploaderModule } from 'ngx-uploader';
import { ApiServiceProvider } from './services/api.service';
import { AuthServiceProvider } from './services/auth.service';
import { ConfigServiceProvider } from './services/config.service';
import { AuthGuardProvider, AuthGuard } from './services/auth-guard.service';
import { AdminGuardProvider, AdminGuard } from './services/admin-guard.service';
import { AppComponent } from './app.component';
import { AppNavComponent } from './components/app-nav';
import { AppFootComponent } from './components/app-foot';
import { AppLoginComponent } from './components/app-login';
import { AppLandingComponent } from './components/app-landing';
import { AppPackageComponent } from './components/app-package';
import { AppSettingsComponent } from './components/app-settings';
import { AppAddUserComponent } from './components/app-add-user';
import { AppUserProfileComponent } from './components/app-user-profile';
import { MarkdownPipe } from './pipes/markdown.pipe';

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
    AppPackageComponent,
    AppSettingsComponent,
    AppAddUserComponent,
    AppUserProfileComponent,
    MarkdownPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: AppLandingComponent },
      { path: 'package/:package',  component: AppPackageComponent },
      { path: 'profile/:username',  component: AppUserProfileComponent },
      { path: 'settings', component: AppSettingsComponent, canActivate: [AuthGuard] },
      { path: 'user/login', component: AppLoginComponent },
      { path: 'user/add', component: AppAddUserComponent, canActivate: [AdminGuard] }
    ]),
    HttpModule,
    FormsModule,
    NgUploaderModule
  ],
  providers: [
    ApiServiceProvider,
    AuthServiceProvider,
    ConfigServiceProvider,
    AuthGuardProvider,
    AdminGuardProvider,
    { provide: AuthHttp, useFactory: authHttpServiceFactory, deps: [Http, RequestOptions] }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
