import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: 'app-nav.component.html'
})
export class AppNavComponent implements OnInit {
  loggedIn: boolean;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.loggedIn = this.auth.isLoggedIn();
  }
}
