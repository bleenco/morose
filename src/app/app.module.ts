import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppLandingComponent } from './components/app-landing';

@NgModule({
  declarations: [
    AppComponent,
    AppLandingComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', component: AppLandingComponent }
    ])
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
