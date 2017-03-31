import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from './logger';
import * as routes from './routes';
import * as web from './web';
import * as auth from './auth';
import { resolve } from 'path';

export let router: express.Router = express.Router();

router.use(bodyParser.json({ limit: '100Mb' }));
router.use(auth.middleware);
router.use(logger.middleware);

router.use('/css', express.static(resolve(__dirname, 'app/css'), { index: false }));
router.use('/js', express.static(resolve(__dirname, 'app/js'), { index: false }));
router.use('/images', express.static(resolve(__dirname, 'app/images'), { index: false }));
router.use('/css/fonts', express.static(resolve(__dirname, 'app/fonts'), { index: false }));

router.put(/\/\-\/user\/org\.couchdb\.user\:(.*)/, routes.doAuth);
router.delete('/-/user/token/:token', routes.logout);
router.get('/:package/:version?', auth.hasAccess, routes.getPackage);
router.get('/:package/-/:tarball', auth.hasAccess, routes.getTarball);
router.get('/-/v1/search', auth.hasAccess, routes.search);
router.put('/:package/:_rev?/:revision?', auth.hasAccess, routes.publishPackage);

router.get('/api/package/get-random', web.getRandomPackages);
router.get('/api/package/search', web.searchPackages);
router.post('/api/user/login', web.login);

router.all('/*', (req: express.Request, res: express.Response) => {
  res.status(200).sendFile(resolve(__dirname, 'app/index.html'));
});
