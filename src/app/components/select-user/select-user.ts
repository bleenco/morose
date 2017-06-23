import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'select-user',
  template: `<label class="control-label">Select User</label>
             <ng-select
               [options]="users"
               (selected)="userSelected($event)">
             </ng-select>`
})
export class SelectUserComponent implements OnInit {
  @Output() userUpdated = new EventEmitter();
  users: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getUsers()
      .subscribe((users: any) => {
        if (users) {
          this.users = users.data.map(u => {
            return { id: u.name, label: `${u.name} (${u.fullName})` };
          });
        }
    });
  }

  userSelected(item) {
    this.userUpdated.emit(item.id);
  }
}
