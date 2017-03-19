import * as express from 'express';
import { router } from './router';
import * as logger from './logger';

export function start(): void {
  let app: express.Application = express();
  app.use(router);
  app.listen(10000, () => logger.info(`server running on port 10000`));
}
