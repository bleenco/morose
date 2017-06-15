import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-organizations',
  templateUrl: 'app-organizations.component.html'
})

export class AppOrganizationsComponent implements OnInit {
  organizations: any;
  error: boolean;
  success: boolean;
  name: string;

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {
    this.auth.getUserOrganizations(this.auth.user.name).then(data => {
      this.organizations = data;
    });
  }

  ngOnInit() {
    this.triggerResize();
  }

  triggerResize(): void {
    window.dispatchEvent(new Event('resize'));
  }

  addOrganization(e: Event): void {
    e.preventDefault();

    this.auth.addOrganization(this.name).then(res => {
      if (res) {
        this.success = true;
        this.error = false;
        setTimeout(() => this.router.navigate(['']), 1000);
      } else {
        this.error = true;
        this.success = false;
      }
    });
  }
}
