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
  user: any;

  constructor(private api: ApiService, private auth: AuthService) {
    this.user = {};
  }

  ngOnInit() {
    this.user = this.auth.getUser();
    this.api.getRandomPackages(this.user.name).subscribe(packages => {
      this.packages = packages;
      this.triggerResize();
    });
  }

  searchPackages(e: Event): void {
    e.preventDefault();
    this.api.getPackagesByKeyword(this.keyword.trim(), this.user.name).subscribe(packages => {
      this.packages = packages;
      this.triggerResize();
    });
  }

  triggerResize(): void {
    window.dispatchEvent(new Event('resize'));
  }
}
