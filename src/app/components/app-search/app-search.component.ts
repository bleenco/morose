import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-search',
  templateUrl: 'app-search.component.html'
})
export class AppSearchComponent implements OnInit {
  packages: any;
  keyword: Observable<string>;

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.packages = [];
  }

  ngOnInit() {
    this.keyword = this.route
      .queryParams
      .map(params => params['keyword'] || '');

    this.keyword.subscribe(searchKeyword => {
      this.packages = [];
      this.search(searchKeyword);
    });
  }

  search(keyword: string): void {
    this.api.getPackagesByKeyword(keyword.trim()).subscribe(packages => {
      this.packages = packages;
    });
  }
}
