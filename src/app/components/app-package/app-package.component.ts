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
  pkgName: string;
  tab: 'readme' | 'deps' | 'devDeps' | 'versions';
  times: any[];
  selectedVersion: string;
  dependencies: { deps: any[], dev: any[] };

  constructor(private api: ApiService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.pkg = null;
    this.pkgName = null;
    this.loading = true;
    this.tab = 'readme';
    this.dependencies = { deps: [], dev: [] };

    this.route.params
      .switchMap((params: Params) => {
        this.pkgName = params.package;
        return this.api.getPackage(params.package);
      })
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

  selectVersion(e: MouseEvent, version: string): void {
    this.selectedVersion = version;
    let data = this.pkg.versions[version];

    this.dependencies.dev = Object.keys(data.devDependencies || []).map(pkg => {
      return { title: pkg, version: data.devDependencies[pkg] };
    });

    this.dependencies.deps = Object.keys(data.dependencies || []).map(pkg => {
      return { title: pkg, version: data.dependencies[pkg] };
    });
  }
}
