import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { storage } from './storage';
import { getRandomInt, getConfig, getAuth, getAuthPath } from './utils';
import * as auth from './auth';
import { writeJsonFile } from './fs';

export function getRandomPackages(req: express.Request, res: express.Response): express.Response {
  let max = storage.length;
  let pkgs = [...Array(9).keys()]
    .map(() => storage[getRandomInt(0, max)])
    .filter(Boolean);

  return res.status(200).json(pkgs);
}

export function searchPackages(req: express.Request, res: express.Response): express.Response {
  let pkgs = storage
    .map(pkg => pkg && pkg.name.indexOf(req.query.keyword) !== -1 ? pkg : null)
    .filter(Boolean);

  return res.status(200).json(pkgs);
}


export function login(req: express.Request, res: express.Response): express.Response {
  let config = getConfig();
  let { username, password } = req.body;

  if (auth.checkUser(username, password)) {
    let token = jwt.sign({ name: username }, config.secret);
    return res.status(200).json({ auth: true, token: token });
  } else {
    return res.status(200).json({ auth: false });
  }
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
