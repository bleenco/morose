import { Component, OnInit, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { UploadOutput, UploadInput, UploadFile } from 'ngx-uploader';

export interface ChangePasswordForm {
  oldpassword: string;
  newpassword1: string;
  newpassword2: string;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: 'app-user-profile.component.html'
})
export class AppUserProfileComponent implements OnInit {
  loading: boolean;
  user: any;
  tab: string;
  success: boolean;
  error: boolean;
  errorMessage: string;
  changePasswordForm: ChangePasswordForm;
  uploadFile: UploadFile;
  uploadInput: EventEmitter<UploadInput>;
  canModify: boolean;

  constructor(private auth: AuthService, private api: ApiService, private route: ActivatedRoute) {
    this.loading = true;
    this.tab = 'profile';
    this.changePasswordForm = {
      oldpassword: null,
      newpassword1: null,
      newpassword2: null
    };

    this.uploadInput = new EventEmitter<UploadInput>();
  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.api.getUserProfile(params.username))
      .subscribe((user: any) => {
        if (user.status) {
          this.user = user.data;
          this.user.avatar = this.api.uri + user.data.avatar;
          if (this.user.name === this.auth.user.name || this.auth.userDetails.role === 'admin') {
            this.canModify = true;
          } else {
            this.canModify = false;
          }
        }

        this.loading = false;
      });
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

    this.auth.updateProfile(this.user.fullName, this.user.email)
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
        data: { username: this.auth.userDetails.name },
        concurrency: 1
      };

      this.uploadInput.emit(event);
    } else if (output.type === 'done') {
      this.auth.updateUserDetails();
    }
  }
}
