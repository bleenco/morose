import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from './logger';
import * as routes from './routes';
import * as auth from './auth';

export let router: express.Router = express.Router();

router.use(bodyParser.json({ limit: '100Mb' }));
router.use(auth.middleware);
router.use(logger.middleware);
router.put(/\/\-\/user\/org\.couchdb\.user\:(.*)/, routes.doAuth);
router.delete('/-/user/token/:token', routes.logout);
router.get('/:package/:version?', auth.hasAccess, routes.getPackage);
router.get('/:package/-/:tarball', auth.hasAccess, routes.getTarball);
router.put('/:package/:_rev?/:revision?', auth.hasAccess, routes.publishPackage);
