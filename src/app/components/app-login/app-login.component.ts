import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'app-login.component.html'
})
export class AppLoginComponent implements OnInit {
  error: boolean;
  username: string;
  password: string;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.auth.user) {
      this.router.navigate(['']);
    }
  }

  login(e: Event) {
    e.preventDefault();

    this.auth.login(this.username, this.password).then(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['']);
      } else {
        this.error = true;
        this.password = '';
      }
    });
  }
}
