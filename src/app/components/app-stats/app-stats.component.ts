import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stats',
  templateUrl: 'app-stats.component.html'
})
export class AppStatsComponent implements OnInit, OnDestroy {
  messages: Subscription;
  loadAvg1Min: { load: number, cores: number };
  loadAvg5Min: { load: number, cores: number };
  loadAvg15Min: { load: number, cores: number };

  constructor(private socket: SocketService) { }

  ngOnInit() {
    this.messages = this.socket.onMessage().subscribe(data => {
      if (data.type === 'loadavg') {
        this.loadAvg1Min = null;
        this.loadAvg5Min = null;
        this.loadAvg15Min = null;

        setTimeout(() => {
          this.loadAvg1Min = { load: data.message.load[0], cores: data.message.cores };
          this.loadAvg5Min = { load: data.message.load[1], cores: data.message.cores };
          this.loadAvg15Min = { load: data.message.load[2], cores: data.message.cores };
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
