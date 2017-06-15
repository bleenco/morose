import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UploadOutput, UploadInput, UploadFile } from 'ngx-uploader';

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
  uploadFile: UploadFile;
  uploadInput: EventEmitter<UploadInput>;

  constructor(private auth: AuthService, private router: Router, private api: ApiService) {
    this.changePasswordForm = {
      oldpassword: null,
      newpassword1: null,
      newpassword2: null
    };

    this.updateProfileForm = {
      name: null,
      email: null
    };

    this.uploadInput = new EventEmitter<UploadInput>();
  }

  ngOnInit() {
    this.tab = 'profile';

    this.updateProfileForm = this.auth.userDetails;
    this.auth.userDetailsUpdated.subscribe(() => this.updateProfileForm = this.auth.userDetails);
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

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const event: UploadInput = {
        type: 'uploadAll',
        url: `${this.api.url}/user/upload-avatar`,
        method: 'POST',
        data: { username: 'jan' },
        concurrency: 1
      };

      this.uploadInput.emit(event);
    } else if (output.type === 'done') {
      this.auth.updateUserDetails();
    }
  }
}
