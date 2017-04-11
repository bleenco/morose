import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stats',
  templateUrl: 'app-stats.component.html'
})
export class AppStatsComponent implements OnInit, OnDestroy {
  messages: Subscription;
  loadAvg1Min: number;
  loadAvg5Min: number;
  loadAvg15Min: number;

  constructor(private socket: SocketService) { }

  ngOnInit() {
    this.messages = this.socket.onMessage().subscribe(data => {
      if (data.type === 'loadavg') {
        this.loadAvg1Min = null;
        this.loadAvg5Min = null;
        this.loadAvg15Min = null;

        setTimeout(() => {
          this.loadAvg1Min = data.message[0];
          this.loadAvg5Min = data.message[1];
          this.loadAvg15Min = data.message[2];
        });
      }

      this.socket.emit({
        type: 'echo',
        message: 'Serbus Jože!'
      });

    });
  }

  ngOnDestroy() {
    this.messages.unsubscribe();
  }
}
