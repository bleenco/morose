import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: 'app-nav.component.html'
})
export class AppNavComponent implements OnInit {
  loggedIn: boolean;
  menuDropped: boolean;

  constructor(
    public auth: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuDropped = false;
      }
    });
  }

  ngOnInit() {
    this.auth.loginStatus.subscribe(loggedIn => this.loggedIn = loggedIn);
    this.auth.checkLogin();
  }

  toggleMenu() {
    this.menuDropped = !this.menuDropped;
  }

  logout(): void {
    this.auth.logout();
    this.menuDropped = false;
  }

  @HostListener('document:click', ['$event'])
  onBlur(e: MouseEvent) {
    if (!this.menuDropped) {
      return;
    }

    let toggleBtn = this.elementRef.nativeElement.querySelector('.drop-menu-act');
    if (e.target === toggleBtn || toggleBtn.contains(<any>e.target)) {
      return;
    }

    let dropMenu: HTMLElement = this.elementRef.nativeElement.querySelector('.nav-dropdown');
    if (dropMenu && dropMenu !== e.target && !dropMenu.contains((<any>e.target))) {
      this.menuDropped = false;
    }
  }
}
