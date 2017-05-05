import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-addorganization',
  templateUrl: 'app-addorganization.component.html'
})
export class AppAddOrganizationComponent implements OnInit {
  organizations: any;
  keyword: string;

  constructor(public auth: AuthService, private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.triggerResize();
    this.auth.checkLogin();
  }

  triggerResize(): void {
    window.dispatchEvent(new Event('resize'));
  }

  addOrganization(): void {
    this.router.navigate(['org/new']);
  }
}
