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

  if (checkUser(username, password)) {
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

export function addUser(req: express.Request, res: express.Response): express.Response | void {
  auth.newUser(req.body)
    .then(auth => {
      writeJsonFile(getAuthPath(), auth)
        .then(() => {
          return res.status(200).json({ message: 'User successfully added.' });
        });
    })
    .catch(err => {
      return res.status(200).json({ message: err });
    });
}
