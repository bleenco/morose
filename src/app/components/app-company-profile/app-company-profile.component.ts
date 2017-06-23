import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-company-profile',
  templateUrl: 'app-company-profile.component.html'
})
export class AppCompanyProfileComponent implements OnInit {
  company: any;
  tab: string;
  error: boolean;
  success: boolean;
  name: string;
  selectedUser: any;
  role: string;

  constructor(public auth: AuthService, private api: ApiService, private route: ActivatedRoute) {
    this.tab = 'packages';
  }

  ngOnInit() {
    this.refreshTable();
  }

  tabClick(tab: string) {
    this.tab = tab;
  }

  addTeam(e: Event): void {
    e.preventDefault();
    this.auth.addTeam(this.name, this.company.name).then(res => {
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

  addMember(e: Event): void {
    e.preventDefault();
    if (this.selectedUser) {
      this.auth.addUserToOrganization(this.selectedUser, this.company.name, this.role).then(res => {
        if (res) {
          this.success = true;
          this.error = false;
          this.refreshTable();
          this.selectedUser = null;
          setTimeout(() => this.success = false, 5000);
        } else {
          this.error = true;
          this.success = false;
        }
      });
    }
  }

  deleteMember(member: string): void {
    if (confirm('Are you sure? This step cannot be reverted!')) {
      this.auth.deleteUserFromOrganization(member, this.company.name).then(res => {
        if (res) {
          this.refreshTable();
        }
      });
    }
  }

  refreshTable(): void {
    this.route.params
      .switchMap((params: Params) => this.api.getCompanyProfile(params.organization))
      .subscribe((company: any) => {
        if (company) {
          this.company = company.data;
          let member = this.company.members.find(m => m.name === this.auth.user.name);
          if (member) {
            this.company.role = member.role;
          } else {
            this.company.role = 'member';
          }
        }
      });
  }

  deleteTeam(team: string): void {
    if (confirm('Are you sure? This step cannot be reverted!')) {
      this.auth.deleteTeam(team, this.company.name).then(res => {
        if (res) {
          this.refreshTable();
        }
      });
    }
  }

  handleUserUpdated(e: Event) {
    this.selectedUser = e;
  }
}
