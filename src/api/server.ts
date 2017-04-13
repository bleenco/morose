import * as express from 'express';
import * as cors from 'cors';
import { router } from './router';
import * as logger from './logger';
import * as fs from './fs';
import * as utils from './utils';
import { initializeStorage } from './storage';
import { ISocketServerOptions, SocketServer } from './socket';
import { loadAverage, networkUtilization } from './system';

export function start(): void {
  let app: express.Application = express();

  initMorose()
    .then(() => utils.getConfig())
    .then(config => {
      app.use(cors());
      app.use(router);
      app.listen(config.port, () => logger.info(`server running on port ${config.port}`));

      let socketOptions: ISocketServerOptions = {
        port: config.wsPort,
        ssl: config.ssl,
        sslKey: config.sslKey,
        sslCert: config.sslCert
      };
      let socketServer = new SocketServer(socketOptions);

      socketServer.start();
      socketServer.connections.subscribe(conn => {
        conn.next({ type: 'status', message: 'connected' });

        conn.subscribe(data => {
          data = JSON.parse(data);

          loadAverage().subscribe(loadAvg => {
            conn.next({ type: 'loadavg', message: loadAvg });
          });

          networkUtilization().subscribe(data => {
            conn.next({ type: 'netutil', message: data });
          });

          if (data.type === 'close') {
            conn.unsubscribe();
          }
        });
      });
  });
}

function initMorose(): Promise<null> {
  let root = utils.getRootDir();

  return fs.exists(root).then(exists => {
    if (exists) {
      return initializeStorage();
    } else {
      return fs.ensureDirectory(root)
        .then(() => utils.writeInitConfig())
        .then(() => fs.ensureDirectory(utils.getFilePath('packages')))
        .then(() => fs.ensureDirectory(utils.getFilePath('logs')))
        .then(() => fs.ensureDirectory(utils.getFilePath('tarballs')))
        .then(() => initializeStorage())
        .then(() => logger.info(`morose successfully initialized.`))
        .catch(err => console.error(err));
    }
  });
}
