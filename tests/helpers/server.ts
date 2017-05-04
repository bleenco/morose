import * as express from 'express';
import { router } from '../../src/api/router';

export class TestServer {
  app: express.Application;
  server: any;

  start(cb: Function): void {
    this.app = express();
    this.app.use(router);
    this.server = this.app.listen(10000, () => cb());
  }

  stop(cb: Function): void {
    this.server.close(() => {
      this.server = null;
      cb();
    });
  }

  isRunning(): boolean {
    return this.server !== null;
  }
}

