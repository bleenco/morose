import { Injectable, Provider } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscriber, Subscription } from 'rxjs';
import { RxWebSocket } from './RxWebSocket';

export enum ConnectionStates {
  CONNECTING,
  CONNECTED,
  CLOSED,
  RETRYING
}

@Injectable()
export class SocketService {
  socket: RxWebSocket;
  connectionState: BehaviorSubject<ConnectionStates>;

  constructor() {
    this.socket = new RxWebSocket();
    this.connectionState = new BehaviorSubject<ConnectionStates>(ConnectionStates.CONNECTING);
    this.socket.didOpen = () => this.connectionState.next(ConnectionStates.CONNECTED);
    this.socket.willOpen = () => this.connectionState.next(ConnectionStates.CONNECTING);
    this.socket.didClose = () => this.connectionState.next(ConnectionStates.CLOSED);
  }

  connect(): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      let sub = this.socket.out.subscribe(subscriber);

      return () => {
        sub.unsubscribe();
      };
    })
    .share()
    .retryWhen(errors => errors.switchMap(err => {

      this.connectionState.next(ConnectionStates.RETRYING);

      if (navigator.onLine) {
        return Observable.timer(3000);
      } else {
        return Observable.fromEvent(window, 'online').take(1);
      }
    }));
  }

  onMessage(): Observable<any> {
    return this.connect();
  }

  emit(msg: any) {
    let data = typeof msg === 'string' ? msg : JSON.stringify(msg);
    this.socket.in.next(data);
  }
}

export let SocketServiceProvider: Provider = {
  provide: SocketService, useClass: SocketService
};
