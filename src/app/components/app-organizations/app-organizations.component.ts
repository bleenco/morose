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
    this.refreshTable();
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
        this.refreshTable();
        this.name = '';
        setTimeout(() => this.success = false, 5000);
      } else {
        this.error = true;
        this.success = false;
      }
    });
  }

  refreshTable(): void {
    this.auth.getUserOrganizations(this.auth.user.name).then(data => {
      this.organizations = data;
    });
  }

  deleteOrganization(organization: string): void {
    if (confirm('Are you sure? This step cannot be reverted!')) {
      this.auth.deleteOrganization(organization).then(res => {
        if (res) {
          this.refreshTable();
        }
      });
    }
  }
}
