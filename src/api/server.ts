import * as express from 'express';
import * as cors from 'cors';
import { router } from './router';
import * as logger from './logger';
import * as fs from './fs';
import * as utils from './utils';
import { initializeStorage } from './storage';
import { Observable } from 'rxjs';

export function start(): void {
  let app: express.Application = express();

  initMorose()
    .then(() => utils.getConfig())
    .then(config => {
      app.use(cors());
      app.use(router);
      app.listen(config.port, () => logger.info(`server running on port ${config.port}`));
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
