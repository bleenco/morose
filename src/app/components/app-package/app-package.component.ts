import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { format } from 'date-fns';

@Component({
  selector: 'app-package',
  templateUrl: 'app-package.component.html'
})
export class AppPackageComponent implements OnInit {
  loading: boolean;
  pkg: any;
  pkgData: any;
  tab: 'readme' | 'versions' | 'info';
  info: any;
  versions: { version: string, date: string }[];

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.loading = true;
    this.tab = 'readme';
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.api.getPackage(params.package))
      .subscribe((pkg: any) => {
        if (pkg.status) {
          this.pkg = pkg.data;
          this.pkgData = this.pkg.readme ?
            this.pkg : this.pkg.versions[this.pkg['dist-tags'].latest];

          this.versions = Object.keys(this.pkg.time).map(version => {
            if (version.includes('.')) {
              return {
                version: version,
                date: format(this.pkg.time[version], 'Do MMMM YYYY HH:mm')
              };
            }
          }).filter(Boolean).reverse();
        }

        this.loading = false;
      });
  }

  versionInfo(version: string): void {
    this.info = this.pkg.versions[version];

    if (this.info.dependencies) {
      this.info.dependencies = Object.keys(this.info.dependencies).map(pkgname => {
        return {
          name: pkgname,
          version: this.info.devDependencies[pkgname]
        };
      });
    } else {
      this.info.dependencies = [];
    }

    if (this.info.devDependencies) {
      this.info.devDependencies = Object.keys(this.info.devDependencies).map(pkgname => {
        return {
          name: pkgname,
          version: this.info.devDependencies[pkgname]
        };
      });
    } else {
      this.info.devDependencies = [];
    }

    this.tab = 'info';
  }
}
