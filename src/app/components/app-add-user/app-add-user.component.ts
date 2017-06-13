import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-user',
  templateUrl: 'app-add-user.component.html'
})
export class AppAddUserComponent implements OnInit {
  user: any;

  constructor(private auth: AuthService) {
    this.user = {};
  }

  ngOnInit() {
    this.user = this.auth.getUser();

    console.log(this.user);
  }
}
