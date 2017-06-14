import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface ChangePasswordForm {
  oldpassword: string;
  newpassword1: string;
  newpassword2: string;
}

export interface UpdateProfileForm {
  name: string;
  email: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: 'app-settings.component.html'
})

export class AppSettingsComponent implements OnInit {
  tab: string;
  success: boolean;
  error: boolean;
  errorMessage: string;
  changePasswordForm: ChangePasswordForm;
  updateProfileForm: UpdateProfileForm;

  constructor(private auth: AuthService, private router: Router) {
    this.changePasswordForm = {
      oldpassword: null,
      newpassword1: null,
      newpassword2: null
    };

    this.updateProfileForm = {
      name: null,
      email: null
    };

    this.auth.loginStatus.subscribe(loggedIn => {
      if (loggedIn) {
        this.auth.getUserDetails(this.auth.user.name).then(data => {
          this.updateProfileForm.email = data.email;
          this.updateProfileForm.name = data.fullName;
        });
      }
    });
  }

  ngOnInit() {
    this.tab = 'profile';
    this.auth.checkLogin();
    this.updateProfileForm.email = this.auth.userDetails.email;
    this.updateProfileForm.name = this.auth.userDetails.fullName;
  }

  tabClick(tab: string) {
    this.tab = tab;
  }

  changePassword(e: Event) {
    e.preventDefault();

    this.auth.changePassword(this.changePasswordForm)
        .then(changed => {
          if (changed) {
            this.success = true;
            this.error = false;
            setTimeout(() => this.success = false, 5000);
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

  updateProfile(e: Event) {
    e.preventDefault();

    this.auth.updateProfile(this.updateProfileForm.name, this.updateProfileForm.email)
      .then(updated => {
        if (updated) {
          this.success = true;
          this.error = false;
          setTimeout(() => this.success = false, 5000);
        } else {
          this.success = false;
          this.error = true;
          this.errorMessage = 'Updating profile failed!';
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
