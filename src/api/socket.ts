import * as ws from 'ws';
import { Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { info } from './logger';
import * as http from 'http';
import * as https from 'https';
import { readFileSync } from 'fs';

export interface ISocketServerOptions {
  port: number;
  ssl: boolean;
  sslKey?: string;
  sslCert?: string;
}

export class SocketServer {
  options: ISocketServerOptions;
  connections: Observable<any>;

  constructor(options: ISocketServerOptions) {
    this.options = options;
  }

  start(): void {
    this.connections = this.createRxServer(this.options)
      .map(this.createRxSocket);
  }

  private createRxServer = (options: ws.IServerOptions) => {
    return new Observable((observer: Observer<any>) => {
      info(`socket server running on port ${options.port} with SSL ${this.options.ssl}`);
      let app: any;

      if (this.options.ssl) {
        app = https.createServer({
          key: readFileSync(this.options.sslKey),
          cert: readFileSync(this.options.sslCert)
        }).listen(options.port);
      } else {
        app = http.createServer().listen(options.port);
      }

      let wss: ws.Server = new ws.Server({ server: app });
      wss.on('connection', (client: ws) => observer.next(client));

      return () => {
        wss.close();
      };
    }).share();
  }

  private createRxSocket = (connection: any) => {
    let messages = Observable.fromEvent(connection, 'message' , msg => {
      return typeof msg.data === 'string' ? msg.data : JSON.parse(msg.data);
    }).merge(Observable.create(observer => {
      connection.on('close', () => {
        connection.close();
        observer.next(JSON.stringify({ type: 'close' }));
      });
    }));

    let messageObserver: any = {
      next(message) {
        if (connection.readyState === 1) {
          connection.send(JSON.stringify(message));
        }
      }
    };

    return Subject.create(messageObserver, messages);
  }
}
