import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-stats',
  templateUrl: 'app-stats.component.html'
})
export class AppStatsComponent implements OnInit {
  loadAvg: any;

  constructor(private socket: SocketService) { }

  ngOnInit() {
    this.socket.onMessage().subscribe(data => {

      if (data.type === 'loadavg') {
        this.loadAvg = data.message;
      }

      this.socket.emit({
        type: 'echo',
        message: 'Serbus Jože!'
      });

    });
  }
}
