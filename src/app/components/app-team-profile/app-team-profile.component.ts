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

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.tab = 'packages';
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.api.getTeamProfile(params.organization, params.team))
      .subscribe((team: any) => {
        if (team) {
          this.team = team.data;
        }
      });
  }

  tabClick(tab: string) {
    this.tab = tab;
  }
}
