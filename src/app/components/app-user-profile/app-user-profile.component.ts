import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-user-profile',
  templateUrl: 'app-user-profile.component.html'
})
export class AppUserProfileComponent implements OnInit {
  loading: boolean;
  user: any;

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.loading = true;
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.api.getUserProfile(params.username))
      .subscribe((user: any) => {
        if (user.status) {
          this.user = user.data;
          this.user.avatar = this.api.uri + user.data.avatar;
        }

        this.loading = false;
      });
  }
}
