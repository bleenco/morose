import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-user',
  templateUrl: 'app-add-user.component.html'
})
export class AppAddUserComponent implements OnInit {
  error: boolean;
  success: boolean;
  username: string;
  password: string;
  fullname: string;
  email: string;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {}

  addUser(e: Event) {
    e.preventDefault();

    this.auth.addUser(this.username, this.password, this.fullname, this.email).then(res => {
      if (res) {
        this.success = true;
        this.error = false;
        setTimeout(() => this.router.navigate(['']), 1000);
      } else {
        this.error = true;
        this.success = false;
      }
    });
  }
}
