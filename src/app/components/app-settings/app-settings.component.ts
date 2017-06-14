import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'app-settings.component.html'
})
export class AppSettingsComponent implements OnInit {
  success: boolean;
  error: boolean;
  errorMessage: string;
  oldpassword: string;
  newpassword1: string;
  newpassword2: string;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {}

  changePassword(e: Event) {
    e.preventDefault();

    this.auth.changePassword(this.oldpassword, this.newpassword1, this.newpassword2)
      .then(changed => {
        if (changed) {
          this.success = true;
          this.error = false;
          setTimeout(() => this.router.navigate(['']), 1000);
        } else {
          this.success = false;
          this.error = true;
          this.errorMessage = 'Changing password failed!';
          setTimeout(() => this.error = false, 5000);
        }
      }).catch(err => {
        this.success = false;
        this.error = true;
        this.errorMessage = err;
        setTimeout(() => this.error = false, 5000);
      });
  }
}
