import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from './logger';
import * as routes from './routes';
import * as web from './web';
import * as auth from './auth';
import { resolve, extname } from 'path';
import * as multer from 'multer';
import { getFilePath, getRootDir } from './utils';

export let router: express.Router = express.Router();

let storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getFilePath('avatars'));
  },
  filename: (req, file, cb) => {
    let ext = extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

let upload: multer.Instance = multer({ storage: storage });

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(resolve(__dirname, '../app/index.html'));
}

router.use(bodyParser.json({ limit: '100Mb', strict: false }));
router.use(auth.middleware);
router.use(logger.middleware);

router.use('/css', express.static(resolve(__dirname, '../app/css'), { index: false }));
router.use('/js', express.static(resolve(__dirname, '../app/js'), { index: false }));
router.use('/images', express.static(resolve(__dirname, '../app/images'), { index: false }));
router.use('/css/fonts', express.static(resolve(__dirname, '../app/fonts'), { index: false }));
router.use('/avatars', express.static(getFilePath('avatars'), { index: false }));

router.get('/user/login', index);
router.get('/package/:package(*)', index);

router.get('/api/package/get-random', web.getRandomPackages);
router.get('/api/package/search+*', web.searchPackages);
router.get('/api/package/:package(*)', web.getPackage);
router.get('/api/users', web.getUsers);
router.post('/api/user/login', web.login);
router.post('/api/user/change-password', web.changePassword);
router.post('/api/user/update-profile', web.updateProfile);
router.post('/api/user/organizations', web.getUserOrganizations);
router.post('/api/user/details', web.getUser);
router.post('/api/user/upload-avatar', upload.any(), web.uploadAvatar);
router.get('/user/login', index);
router.get('/api/user/profile', web.userProfile);
router.get('/api/org/profile', web.organizationProfile);
router.get('/api/org/team/profile', web.teamProfile);
router.post('/api/org/delete', web.deleteOrganization);
router.post('/api/team/delete', web.deleteTeam);
router.post('/api/user/delete', web.deleteUser);
router.post('/api/team/user/delete', web.deleteUserFromTeam);
router.post('/api/org/user/delete', web.deleteUserFromOrganization);
router.post('/api/user/add', web.newUser);
router.post('/api/org/add', web.newOrganization);
router.post('/team/add', web.newTeam);
router.post('/org/user/add', web.addUserToOrganization);
router.post('/team/user/add', web.addUserToTeam);
router.post('/team/delete', web.deleteTeam);
router.post('/team/user/delete', web.deleteUserFromTeam);
router.post('/org/user/delete', web.deleteUserFromOrganization);
router.post('/org/delete', web.deleteOrganization);
router.post('/org/user/role', web.changeUserRole);
router.post('/pkg/publish', web.publishPackage);

router.put(/\/\-\/user\/org\.couchdb\.user\:(.*)/, routes.doAuth);
router.get(/\/\-\/user\/org\.couchdb\.user\:(.*)/, routes.getUser);
router.delete('/-/user/token/:token', routes.logout);
router.get('/-/whoami', routes.whoami);
router.get('/-/ping', routes.ping);
router.get('/:package/:version?', routes.getPackage);
router.get('/:package(*)/-/:tarball(*)', routes.getTarball);
router.get('/-/package/:package(*)/dist-tags', routes.distTag);
router.get('/-/package/:package(*)/collaborators?', auth.hasAccess, routes.getCollaborators);
router.get('/-/org/*/package*', auth.hasAccess, routes.organizationAccess);
router.get('/-/team/*/package*', auth.hasAccess, routes.organizationAccess);
router.get('/-/v1/search', auth.hasAccess, routes.search);
router.get('/-/_view/starredByUser?', auth.hasAccess, routes.starredByUser);
router.delete('/-/team/*/package*', auth.hasAccess, routes.setOrganizationAccess);
router.delete('/:package/-rev/:version?', auth.hasAccess, routes.unpublishPackage);
router.delete('/:org?/:package/-/:org?/:tgz/-rev/(*)', auth.hasAccess, routes.setPackageDetails);
router.delete('/-/package/:package(*)/dist-tags/(*)', auth.hasAccess, routes.removeDistTag);
router.put('/-/team/*/package*', auth.hasAccess, routes.setOrganizationAccess);
router.put('/:package/:_rev/:revision?', auth.hasAccess, routes.setPackageDetails);
router.put('/:package/:revision?', auth.hasAccess, routes.updatePackage);
router.put('/-/package/:package(*)/dist-tags/:tag(*)', routes.addDistTag);
router.post('/-/package/*/access', routes.setPackageAccess);

router.all('/*', index);
