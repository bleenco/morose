import { Injectable, Provider } from '@angular/core';

@Injectable()
export class ConfigService {;
  wsurl: string;

  constructor() {
    this.wsurl = `ws://${location.hostname}:10001`;
  }
}

export let ConfigServiceProvider: Provider = {
  provide: ConfigService, useClass: ConfigService
};
