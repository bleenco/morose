import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: 'app-landing.component.html'
})
export class AppLandingComponent implements OnInit {
  packages: any[];
  keyword: string;

  constructor(private api: ApiService, private auth: AuthService) { }

  ngOnInit() {
    let token = this.auth.isLoggedIn() ? this.auth.getToken() : null;

    this.api.getRandomPackages(token).subscribe(packages => {
      this.packages = packages;
      this.triggerResize();
    });
  }

  searchPackages(e: Event): void {
    e.preventDefault();
    this.api.getPackagesByKeyword(this.keyword.trim()).subscribe(packages => {
      this.packages = packages;
      this.triggerResize();
    });
  }

  triggerResize(): void {
    window.dispatchEvent(new Event('resize'));
  }
}
