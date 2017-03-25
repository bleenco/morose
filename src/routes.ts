import * as express from 'express';
import * as auth from './auth';
import * as logger from './logger';
import { getConfig, getConfigPath, getFilePath } from './utils';
import { writeJsonFile } from './fs';
import { Package } from './package';
import * as proxy from './storage-proxy';
import { storage, findPackage } from './storage';

export function doAuth(
  req: auth.AuthRequest,
  res: express.Response,
  next: express.NextFunction
): void {
  let token;

  if (req.body.name && req.body.password) {
    let buf = Buffer.from(`${req.body.name}:${req.body.password}`);
    token = auth.aesEncrypt(buf).toString();
  } else {
    token = null;
  }

  if (token) {
    auth.login({ name: req.body.name, password: req.body.password })
      .then(index => {
        let config = getConfig();
        config.users[index].tokens = config.users[index].token || [];
        config.users[index].tokens.push(token);

        writeJsonFile(getConfigPath(), config).then(() => {
          logger.info(`${req.body.name} logged in.`);
          res.status(201).json({ token: token });
        });
      })
      .catch(() => {
        logger.info(`authorization failed for user ${req.body.name} from ${req.ip}`);
        res.status(401).send();
      });
  } else {
    res.status(401);
    return next();
  }
}

export function logout(req: auth.AuthRequest, res: express.Response): express.Response {
  let token = req.params.token;
  if (token !== null) {
    auth.logout(token).then(name => {
      logger.info(`${name} logged out.`);
      return res.status(200).json({ message: 'successfully logged out' })
    });
  } else {
    return res.status(401).json({ message: 'not logged in' });
  }
}

export function getPackage(req: auth.AuthRequest, res: express.Response): express.Response {
  let packageName: string = req.params.package;
  let version: string | null = req.params.version || null;

  if (packageName.indexOf('@') !== -1) {
    packageName = packageName.replace(/^(@.*)(\/)(.*)$/, '$1%2F$3');
  }

  let data = findPackage(packageName);

  if (data) {
    return res.status(200).json(data);
  } else {
    proxy.findUplinkPackages(packageName).then(urls => {
      if (urls.length) {
        proxy.getResponse(urls[0], 'GET').then(body => {
          return res.status(200).json(JSON.parse(body));
        });
      } else {
        return res.status(404).json({ message: `package not found` });
      }
    });
  }
}

export function getTarball(req: auth.AuthRequest, res: express.Response): void {
  let tarball = req.params.tarball;
  let tarballPath = getFilePath(`tarballs/${tarball}`);
  res.type('application/x-compressed');
  res.header('Content-Disposition', `filename=${tarball}`);
  res.status(200).download(tarballPath);
}

export function publishPackage(req: auth.AuthRequest, res: express.Response): void {
  let name: string = req.params.package;
  let metadata = req.body;

  let pkgIndex = storage.packages.findIndex(pkg => pkg.name === name);
  let pkgMetadata = {
    name: name,
    versions: storage.packages[pkgIndex].versions,
    'dist-tags': {},
    _attachments: {}
  } || null;

  let pkg = new Package({ name: name, metadata: pkgMetadata });
  pkg.saveVersionFromMetadata(metadata)
    .then(() => {
      return res.status(200).json({ message: 'package published' });
    })
    .catch(err => {
      return res.status(500).json({ message: 'error saving package version' });
    });
}

