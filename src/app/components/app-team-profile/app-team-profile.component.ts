import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-team-profile',
  templateUrl: 'app-team-profile.component.html'
})

export class AppTeamProfileComponent implements OnInit {
  team: any;
  tab: string;
  success: boolean;
  error: boolean;
  selectedUser: any;

  constructor(public auth: AuthService, private api: ApiService, private route: ActivatedRoute) {
    this.tab = 'packages';
  }

  ngOnInit() {
    this.refreshTable();
  }

  tabClick(tab: string) {
    this.tab = tab;
  }

  refreshTable() {
    this.route.params
      .switchMap((params: Params) => this.api.getTeamProfile(params.organization, params.team))
      .subscribe((team: any) => {
        if (team) {
          this.team = team.data;
        }
      });
  }

  addMember(e: Event): void {
    e.preventDefault();
    if (this.selectedUser) {
      this.auth.addUserToTeam(this.selectedUser, this.team.name, this.team.organization)
        .then(res => {
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
      this.auth.deleteUserFromTeam(member, this.team.name, this.team.organization).then(res => {
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
