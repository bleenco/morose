import * as express from 'express';
import { storage } from './storage';
import { getRandomInt } from './utils';

export function getRandomPackages(req: express.Request, res: express.Response): express.Response {
  let max = storage.packages.length;
  let pkgs = [...Array(9).keys()].map(() => storage.packages[getRandomInt(0, max)]);

  return res.status(200).json(pkgs);
}

export function searchPackages(req: express.Request, res: express.Response): express.Response {
  let pkgs = storage.packages
    .map(pkg => pkg && pkg.name.indexOf(req.query.keyword) !== -1 ? pkg : null)
    .filter(Boolean);

  return res.status(200).json(pkgs);
}
