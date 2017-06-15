import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-company-profile',
  templateUrl: 'app-company-profile.component.html'
})
export class AppCompanyProfileComponent implements OnInit {
  company: any;
  tab: string;

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.tab = 'packages';
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.api.getCompanyProfile(params.organization))
      .subscribe((company: any) => {
        if (company) {
          this.company = company.data;
        }
      });
  }

  tabClick(tab: string) {
    this.tab = tab;
  }
}
