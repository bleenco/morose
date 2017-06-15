import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { storage, getRandomPackage } from './storage';
import { getRandomInt, getConfig, getAuth, getAuthPath } from './utils';
import * as auth from './auth';
import { writeJsonFile } from './fs';
import * as fuse from 'fuse.js';

export function getRandomPackages(req: express.Request, res: express.Response): any {
  let username: any = auth.decodeToken(req.query.token);
  username = username && username.name || 'anonymous';
  let set = new Set();
  let max = storage.length > 9 ? 9 : storage.length;
  let authData = getAuth();

  const findUserPackage = () => {
    return new Promise(resolve => {
      let pkg = getRandomPackage();
      if (pkg) {
        auth.userHasReadPermissions(username, pkg.name, authData)
          .then(hasPermission => resolve({ pkg, hasPermission }));
      } else {
        resolve();
      }
    });
  };

  const loop = (i) => {
    return findUserPackage().then((data: any) => {
      if (data && data.hasPermission && !set.has(data.pkg)) {
        set.add(data.pkg);
        i -= 1;
      }

      if (i > 0) {
        return loop(i);
      }
    });
  };

  loop(max).then(() => {
    return res.status(200).json(Array.from(set));
  });
}

export function getPackage(req: express.Request, res: express.Response): express.Response {
  let pkgName = req.params.package;
  let index = storage.findIndex(pkg => pkg.name === pkgName);
  if (index !== -1) {
    return res.status(200).json({ status: true, data: storage[index] });
  } else {
    return res.status(200).json({ status: false });
  }
}

export function searchPackages(req: express.Request, res: express.Response): express.Response {
  let word = req.query.keyword;
  let search = new fuse(storage, {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: ['name', 'description', 'version', 'readme']
  });

  return res.status(200).json(search.search(word));
}


export function login(req: express.Request, res: express.Response): express.Response {
  let config = getConfig();
  let { username, password } = req.body;

  if (auth.checkUser(username, password)) {
    let payload: object = { name: username };
    let token = jwt.sign(payload, config.secret, { expiresIn: '1Y' });
    return res.status(200).json({ auth: true, token: token });
  } else {
    return res.status(200).json({ auth: false });
  }
}

export function changePassword(
  req: express.Request, res: express.Response): express.Response | void {
    let config = getConfig();
    let { username, password } = req.body;

    auth.changePassword(username, password)
      .then(() => {
        let payload: object = { name: username };
        let token = jwt.sign(payload, config.secret, { expiresIn: '1Y' });
        return res.status(200).json({ auth: true, token: token });
      }).catch(() => res.status(200).json({ auth: false }));
}

export function updateProfile(
  req: express.Request, res: express.Response): express.Response | void {
    let { username, name, email } = req.body;

    auth.updateProfile(username, name, email)
      .then(() => res.status(200).json({ data: true }))
      .catch(() => res.status(200).json({ data: false }));
}

export function getUserOrganizations(
  req: express.Request,
  res: express.Response): express.Response {
    let username = req.body.username;
    let auth = getAuth();
    let orgs = auth.organizations
      .filter(org => org.members.findIndex(u => u.name === username) !== -1);

    return res.status(200).json(orgs);
}

export function newUser(req: express.Request, res: express.Response): express.Response | void {
  let authObj = getAuth();
  let config = getConfig();
  auth.newUser(req.body, authObj, config)
    .then(auth => writeJsonFile(getAuthPath(), auth)
    .then(() => res.status(200).json({ data: true })))
    .catch(err => res.status(200).json({ message: err }));
}

export function getUser(req: express.Request, res: express.Response): express.Response | void {
  let username = req.body.username;
  let authObject = getAuth();
  return res.status(200).json(auth.getUserByUsername(username, authObject));
}

export function newOrganization(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.newOrganization(req.body.organization, req.body.username, authObj)
      .then(auth => writeJsonFile(getAuthPath(), auth)
      .then(() => res.status(200).json({ data: true })))
      .catch(err => res.status(200).json({ message: err }));
}

export function newTeam(req: express.Request, res: express.Response): express.Response | void {
  let authObj = getAuth();
  auth.newTeam(req.body, authObj)
    .then(auth => writeJsonFile(getAuthPath(), auth)
    .then(() => res.status(200).json({ data: true })))
    .catch(err => res.status(200).json({ message: err }));
}

export function addUserToOrganization(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.addUserToOrganization(req.body.username, req.body.organization, req.body.role, authObj)
      .then(auth => writeJsonFile(getAuthPath(), auth)
      .then(() => res.status(200).json({ data: true })))
      .catch(err => res.status(200).json({ message: err }));
}

export function addUserToTeam(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.addUserToTeam(req.body, authObj)
      .then(auth => writeJsonFile(getAuthPath(), auth)
      .then(() => res.status(200).json({ data: true })))
      .catch(err => res.status(200).json({ message: err }));
}

export function deleteTeam(req: express.Request, res: express.Response): express.Response | void {
  let authObj = getAuth();
  auth.deleteTeam(req.body.team, req.body.organization, authObj)
    .then(auth => writeJsonFile(getAuthPath(), auth)
    .then(() => res.status(200).json({ data: true })))
    .catch(err => res.status(200).json({ message: err }));
}

export function deleteUserFromTeam(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.deleteUserFromTeam(req.body, authObj)
      .then(auth => writeJsonFile(getAuthPath(), auth)
      .then(() => res.status(200).json({ data: true })))
      .catch(err => res.status(200).json({ message: err }));
}

export function deleteUserFromOrganization(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.deleteUserFromOrganization(req.body.username, req.body.organization, authObj)
      .then(auth => writeJsonFile(getAuthPath(), auth)
      .then(() => res.status(200).json({ data: true })))
      .catch(err => res.status(200).json({ message: err }));
}

export function deleteOrganization(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.deleteOrganization(req.body.organization, authObj)
      .then(auth => writeJsonFile(getAuthPath(), auth)
      .then(() => res.status(200).json({ data: true })))
      .catch(err => res.status(200).json({ message: err }));
}

export function changeUserRole(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.changeUserRole(req.body.username, req.body.organization, req.body.team, authObj)
      .then(auth => writeJsonFile(getAuthPath(), auth)
      .then(() => res.status(200).json({ data: true })))
      .catch(err => res.status(200).json({ message: err }));
}

export function publishPackage(
  req: express.Request, res: express.Response): express.Response | void {
    let authObj = getAuth();
    auth.publishPackage(
      req.body.pkgName, req.body.username, req.body.organization,
      req.body.teams, req.body.version, authObj)
        .then(auth => writeJsonFile(getAuthPath(), auth)
        .then(() => res.status(200).json({ data: true })))
        .catch(err => res.status(200).json({ message: err }));
}

export function uploadAvatar(req: express.Request | any, res: express.Response): any {
  let username = req.body.username;
  let webPath = `/avatars/${req.files[0].filename}`;
  let auth = getAuth();
  let userIndex = auth.users.findIndex(user => user.name === username);

  auth.users[userIndex].avatar = webPath;

  Promise.resolve()
    .then(() => writeJsonFile(getAuthPath(), auth))
    .then(() => res.status(200).json({ data: webPath }))
    .catch(err => res.status(200).json({ message: err }));
}

export function userProfile(req: express.Request, res: express.Response): any {
  let username = req.query.username;
  let auth = getAuth();
  let user = auth.users.find(user => user.name === username);
  delete user.password;

  return res.status(200).json({ status: true, data: user });
}
