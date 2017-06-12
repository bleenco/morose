import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'app-settings.component.html'
})
export class AppSettingsComponent implements OnInit {
  user: any;

  constructor(private auth: AuthService) {
    this.user = {};
  }

  ngOnInit() {
    this.user = this.auth.getUser();

    console.log(this.user);
  }
}
