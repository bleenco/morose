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
import { AppSearchComponent } from './components/app-search';
import { AppPackageComponent } from './components/app-package';
import { AppUsersComponent } from './components/app-users';
import { AppUserProfileComponent } from './components/app-user-profile';
import { AppCompanyProfileComponent } from './components/app-company-profile';
import { AppOrganizationsComponent } from './components/app-organizations';
import { AppTeamProfileComponent } from './components/app-team-profile';
import { SelectUserComponent } from './components/select-user/select-user';
import { MarkdownPipe } from './pipes/markdown.pipe';
import { SelectModule } from 'ng-select';

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
    AppSearchComponent,
    AppPackageComponent,
    AppUsersComponent,
    AppUserProfileComponent,
    AppCompanyProfileComponent,
    AppOrganizationsComponent,
    AppTeamProfileComponent,
    SelectUserComponent,
    MarkdownPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: AppLandingComponent },
      { path: 'search', component: AppSearchComponent },
      { path: 'package/:package',  component: AppPackageComponent },
      { path: 'profile/:username',  component: AppUserProfileComponent, canActivate: [AuthGuard] },
      { path: 'org/:organization',
        component: AppCompanyProfileComponent,
        canActivate: [AuthGuard] },
      { path: 'org/:organization/team/:team',
        component: AppTeamProfileComponent,
        canActivate: [AuthGuard] },
      { path: 'user/login', component: AppLoginComponent },
      { path: 'users', component: AppUsersComponent, canActivate: [AdminGuard] },
      { path: 'org', component: AppOrganizationsComponent, canActivate: [AuthGuard] }
    ]),
    HttpModule,
    FormsModule,
    NgUploaderModule,
    SelectModule
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
