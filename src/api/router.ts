import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from './logger';
import * as routes from './routes';
import * as web from './web';
import * as auth from './auth';
import { resolve } from 'path';

export let router: express.Router = express.Router();

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(resolve(__dirname, '../app/index.html'));
}

router.use(bodyParser.json({ limit: '100Mb' }));
router.use(auth.middleware);
router.use(logger.middleware);

router.use('/css', express.static(resolve(__dirname, '../app/css'), { index: false }));
router.use('/js', express.static(resolve(__dirname, '../app/js'), { index: false }));
router.use('/images', express.static(resolve(__dirname, '../app/images'), { index: false }));
router.use('/css/fonts', express.static(resolve(__dirname, '../app/fonts'), { index: false }));

router.get('/statistics', index);
router.get('/user/login', index);

router.get('/api/package/get-random', web.getRandomPackages);
router.get('/api/package/search', web.searchPackages);
router.post('/api/user/login', web.login);
router.post('/api/user/organizations', web.getUserOrganizations);
router.get('/user/login', index);
router.post('/user/add', web.newUser);
router.post('/org/add', web.newOrganization);
router.post('/team/add', web.newTeam);
router.post('/org/user/add', web.addUserToOrganization);
router.post('/team/user/add', web.addUserToTeam);
router.post('/team/delete', web.deleteTeam);
router.post('/team/user/delete', web.deleteUserFromTeam);
router.post('/org/user/delete', web.deleteUserFromOrganization);
router.post('/org/delete', web.deleteOrganization);
router.post('/org/user/role', web.changeUserRole);
router.post('/pkg/publish', web.publishPackage);
router.post('/:/-/package/*/access', routes.setPackageAccess);

router.put(/\/\-\/user\/org\.couchdb\.user\:(.*)/, routes.doAuth);
router.get(/\/\-\/user\/org\.couchdb\.user\:(.*)/, routes.getUser);
router.delete('/-/user/token/:token', routes.logout);
router.get('/-/whoami', routes.whoami);
router.get('/-/ping', routes.ping);
router.get('/:package/:version?', routes.getPackage);
router.get('/:package(*)/-/:tarball', auth.hasAccess, routes.getTarball);
router.get('/-/package/(*)/collaborators?', auth.hasAccess, routes.getCollaborators);
router.get('/-/org/*/package*', auth.hasAccess, routes.organizationAccess);
router.get('/-/team/*/package*', auth.hasAccess, routes.organizationAccess);
router.get('/-/v1/search', auth.hasAccess, routes.search);
router.get('/-/_view/starredByUser?', auth.hasAccess, routes.starredByUser);
router.delete('/-/team/*/package*', auth.hasAccess, routes.setOrganizationAccess);
router.put('/-/team/*/package*', auth.hasAccess, routes.setOrganizationAccess);
router.put('/:package/:_rev/:revision?', auth.hasAccess, routes.updatePackageOwner);
router.put('/:package/:revision?', auth.hasAccess, routes.updatePackage);

router.all('/*', index);
