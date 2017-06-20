import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: 'app-users.component.html'
})
export class AppUsersComponent implements OnInit {
  error: boolean;
  success: boolean;
  users: any;
  username: string;
  password: string;
  fullname: string;
  email: string;
  tab: string;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.tab = 'list';
    this.refreshTable();
  }

  addUser(e: Event) {
    e.preventDefault();

    this.auth.addUser(this.username, this.password, this.fullname, this.email).then(res => {
      if (res) {
        this.success = true;
        this.error = false;
        this.refreshTable();
        setTimeout(() => this.success = false, 5000);
      } else {
        this.error = true;
        this.success = false;
      }
    });
  }

  tabClick(tab: string) {
    this.tab = tab;
  }

  refreshTable() {
    this.api.getUsers()
    .subscribe((users: any) => {
      if (users) {
        this.users = users.data;
      }
    });
  }

  deleteUser(user: string): void {
    if (confirm('Are you sure? This step cannot be reverted!')) {
      this.auth.deleteUser(user).then(res => {
        if (res) {
          this.refreshTable();
        }
      });
    }
  }
}
