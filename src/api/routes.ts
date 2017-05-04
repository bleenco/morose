import * as express from 'express';
import * as auth from './auth';
import * as logger from './logger';
import { getConfig, getConfigPath, getFilePath } from './utils';
import { writeJsonFile, exists, ensureDirectory, readJsonFile } from './fs';
import { IPackage } from './package';
import * as proxy from './proxy';
import { storage, findPackage } from './storage';
import { createReadStream, createWriteStream } from 'fs';
import * as request from 'request';
import { dirname } from 'path';

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
      return res.status(200).json({ message: 'successfully logged out' });
    });
  } else {
    return res.status(401).json({ message: 'not logged in' });
  }
}

export function getPackage(req: auth.AuthRequest, res: express.Response): void | express.Response {
  let baseUrl = req.protocol + '://' + req.get('host');
  let pkgName: string = req.params.package;
  let config = getConfig();

  let pkgJsonPath = getFilePath(`packages/${pkgName}/package.json`);
  if (pkgName.indexOf('@') !== -1) {
    pkgName = pkgName.replace(/^(@.*)(\/)(.*)$/, '$1%2F$3');
  }

  exists(pkgJsonPath).then(e => {
    if (e) {
      readJsonFile(pkgJsonPath).then((jsonData: IPackage) => res.status(200).json(jsonData));
    } else {
      proxy.fetchUpstreamData(config.upstream, pkgName, baseUrl).then((body: IPackage) => {
        body = proxy.changeUpstreamDistUrls(config.upstream, baseUrl, body);
        ensureDirectory(dirname(pkgJsonPath)).then(() => {
          writeJsonFile(pkgJsonPath, body).then(() => res.status(200).json(body));
        });
      });
    }
  });
}

export function getTarball(req: auth.AuthRequest, res: express.Response) {
  let config = getConfig();
  let baseUrl = req.protocol + '://' + req.get('host');
  let pkgName = req.params.package;
  let tarball = req.params.tarball;
  let tarballPath = getFilePath(`tarballs/${pkgName.replace('%2F', '/')}/${tarball}`);
  let fetchUrl = config.upstream + '/' + pkgName + '/-/' + tarball;

  exists(tarballPath).then(e => {
    if (e) {
      logger.httpIn(req.originalUrl, 'GET', null);
      createReadStream(tarballPath).pipe(res);
    } else {
      if (config.useUpstream) {
        ensureDirectory(dirname(tarballPath)).then(() => {
          request({ url: fetchUrl, headers: { 'Accept-Encoding': 'gzip' }})
            .pipe(createWriteStream(tarballPath))
            .on('finish', () => {
              logger.httpOut(fetchUrl, 'GET', '200');
              res.type('application/x-compressed');
              res.header('Content-Disposition', `filename=${tarball}`);
              res.status(200).download(tarballPath);
            });
        });
      } else {
        res.status(404).json({ message: 'not found' });
      }
    }
  });
}

export function publishPackage(req: auth.AuthRequest, res: express.Response): void {
  let name: string = req.params.package;
  let metadata = req.body;

  let pkg = new Package({ name: name });
  pkg.saveVersionFromMetadata(metadata)
    .then(() => {
      return res.status(200).json({ message: 'package published' });
    })
    .catch(err => {
      return res.status(500).json({ message: 'error saving package version' });
    });
}

export function whoami(req: auth.AuthRequest, res: express.Response): express.Response {
  return res.status(200).json({ username: res.locals.remote_user.name });
}

export function search(req: auth.AuthRequest, res: express.Response): void {
  let text = req.query.text;
  let size = req.query.size || 20;

  let packages = storage.packages.map(pkg => {
    if (!pkg) {
      return;
    }

    if (pkg.name.indexOf(text) !== -1) {
      let versions = Object.keys(pkg.versions).map(ver => pkg.versions[ver]);
      let latest = versions[versions.length - 1];

      // TODO: date, author and keywords
      return {
        package: {
          name: pkg.name,
          version: latest.version,
          description: pkg.description,
          author: latest.author
        }
      };
    } else {
      return;
    }
  }).filter(Boolean).filter((pkg, i) => i <= size);

  let results = {
    objects: packages
  };

  res.status(200).json(results);
}

