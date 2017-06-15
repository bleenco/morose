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

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.loading = true;
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.api.getPackage(params.package))
      .subscribe((pkg: any) => {
        if (pkg.status) {
          this.pkg = pkg.data;
          this.pkgData = this.pkg.readme ?
            this.pkg : this.pkg.versions[this.pkg['dist-tags'].latest];
        }

        this.loading = false;
      });
  }
}
