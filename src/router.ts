import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from './logger';
import * as routes from './routes';
import * as auth from './auth';

export let router: express.Router = express.Router();

router.use(bodyParser.json());
router.use(logger.middleware);
router.use(auth.middleware);
router.put(/\/\-\/user\/org\.couchdb\.user\:(.*)/, routes.doAuth);
router.get('/:package/:version?', auth.hasAccess, routes.getPackage);
