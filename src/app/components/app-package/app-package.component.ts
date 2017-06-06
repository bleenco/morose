import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-package',
  templateUrl: 'app-package.component.html'
})
export class AppPackageComponent implements OnInit {
  loading: boolean;
  pkg: any;
  pkgData: any;
  tab: 'readme' | 'deps' | 'devDeps' | 'versions';
  times: any[];

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.loading = true;
    this.tab = 'versions';
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.api.getPackage(params.package))
      .subscribe((pkg: any) => {
        if (pkg.status) {
          this.pkg = pkg.data;
          this.pkgData = this.pkg.readme ?
            this.pkg : this.pkg.versions[this.pkg['dist-tags'].latest];

          this.times = Object.keys(this.pkg.time).map(version => {
            return { version: version, time: this.pkg.time[version] };
          }).reverse();
        }

        this.loading = false;
      });
  }
}
