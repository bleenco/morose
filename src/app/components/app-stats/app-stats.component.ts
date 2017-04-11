import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-stats',
  templateUrl: 'app-stats.component.html'
})
export class AppStatsComponent implements OnInit {

  constructor(private socket: SocketService) { }

  ngOnInit() {
    this.socket.onMessage().subscribe(data => {
      console.log(data);
    });
  }
}
