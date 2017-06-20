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

  constructor(public auth: AuthService, private api: ApiService, private route: ActivatedRoute) {
    this.tab = 'packages';
  }

  ngOnInit() {
    this.refreshTable();
  }

  tabClick(tab: string) {
    this.tab = tab;
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
}
