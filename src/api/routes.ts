import * as express from 'express';
import * as auth from './auth';
import * as logger from './logger';
import { getConfig, getAuthPath, getFilePath, getAuth } from './utils';
import { writeJsonFile, exists, ensureDirectory, readJsonFile } from './fs';
import { IPackage, Package } from './package';
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
        let auth = getAuth();
        auth.users[index].tokens = auth.users[index].token || [];
        auth.users[index].tokens.push(token);

        writeJsonFile(getAuthPath(), auth).then(() => {
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

export function getUser(req: auth.AuthRequest, res: express.Response): void | express.Response {
  let auth = getAuth();
  let user = auth.users.find(u => u.name === req.params[0]);
  if (user) {
    return res.status(200).json({
      _id: 'org.couchdb.user:admin', email: user.email, name: user.name
    });
  } else {
    return res.status(404).json('');
  }
}

export function getPackage(req: auth.AuthRequest, res: express.Response): void | express.Response {
  let pkgName: string = req.params.package;

  if (req.headers.referer && req.headers.referer.split(' ')[0] === 'owner') {
    let auth = getAuth();
    let pkg = auth.packages.find(p => p.name === pkgName);
    if (pkg) {
      let usernames = pkg.owners;
      let users = usernames.map(username => {
        let user = auth.users.find(u => u.name === username);
        if (user) {
          return { name: username, email: user.email };
        } else {
          return false;
        }
      }).filter(Boolean);

      res.status(200).json({ name: pkgName, maintainers: users });
    } else {
      return res.status(404).json('');
    }
  } else {
    let baseUrl = req.protocol + '://' + req.get('host');
    let config = getConfig();
    let authFile = getAuth();
    let user = auth.getUserByToken(res.locals.remote_user.token, authFile);
    auth.userHasReadPermissions(user.name, pkgName, authFile).then(hasPermissions => {
      if (hasPermissions) {
        let pkgJsonPath = getFilePath(`packages/${pkgName}/package.json`);
        if (pkgName.indexOf('@') !== -1) {
          pkgName = pkgName.replace(/^(@.*)(\/)(.*)$/, '$1%2F$3');
        }

        exists(pkgJsonPath).then(e => {
          if (e) {
            readJsonFile(pkgJsonPath)
              .then((jsonData: IPackage) => res.status(200).json(jsonData));
          } else {
            if (config.useUpstream) {
              proxy.fetchUpstreamData(config.upstream, pkgName, baseUrl)
                .then((body: IPackage) => {
                  if (body.versions) {
                    body = proxy.changeUpstreamDistUrls(config.upstream, baseUrl, body);
                    ensureDirectory(dirname(pkgJsonPath)).then(() => {
                      writeJsonFile(pkgJsonPath, body).then(() => res.status(200).json(body));
                    });
                  } else {
                    return res.status(404).json('');
                  }
                });
            } else {
              return res.status(404).json('');
            }
          }
        }).catch(() => res.status(404).json(''));
      } else {
        return res.status(401).json({ error: `you do not have permission for `
              + `"${pkgName}". Are you logged in as the correct user?` });
      }
    }).catch(() => res.status(404).json(''));
  }
}

export function updatePackageOwner(
  req: auth.AuthRequest, res: express.Response): void | express.Response {
    let request = req.headers.referer.split(' ');
    if (request[0] === 'owner') {
      if (request[1] === 'add') {
        let pkgName: string = request[3];
        let username: string = request[2];
        let authFile = getAuth();
        let user = auth.getUserByToken(res.locals.remote_user.token, authFile);
        auth.userHasWritePermissions(user.name, pkgName, authFile).then(hasPermissions => {
          if (hasPermissions) {
            let pkg = authFile.packages.find(p => p.name === pkgName);
            let userIndex = pkg.owners.findIndex(o => o === username);
            if (userIndex < 0 && pkg) {
              pkg.owners.push(username);
              writeJsonFile(getAuthPath(), authFile)
              .then(() => res.status(200).json({ name: pkgName, 'maintainers': pkg.owners }));
            } else {
              return res.status(406).json('');
            }
          } else {
            return res.status(403).json({ error: `you do not have permission to publish `
              + `"${pkgName}". Are you logged in as the correct user?` });
          }
        })
        .catch(() => res.status(404).json(''));
      } else if (request[1] === 'rm') {
        let pkgName: string = request[3];
        let username: string = request[2];
        let authFile = getAuth();
        let user = authFile.users
          .find(u => u.tokens.findIndex(t => t === res.locals.remote_user.token) != -1);
        auth.userHasWritePermissions(user.name, pkgName, authFile).then(hasPermissions => {
          if (hasPermissions) {
            let pkg = authFile.packages.find(p => p.name === pkgName);
            if (pkg) {
              let index = pkg.owners.findIndex(u => u === username);
              if (index !== -1 && pkg.owners.length > 1) {
                pkg.owners.splice(index, 1);
                writeJsonFile(getAuthPath(), authFile)
                .then(() => res.status(200).json({ name: pkgName, 'maintainers': pkg.owners }));
              } else {
                return res.status(404).json('');
              }
            }
          } else {
            return res.status(403).json({ error: `you do not have permission to publish `
              + `"${pkgName}". Are you logged in as the correct user?` });
          }
        })
        .catch(() => res.status(304).json(''));
      } else {
        return res.status(200).json({ success: true });
      }
    } else {
      return res.status(200).json({ success: true });
    }
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
        res.status(404).json({ error: 'not found' });
      }
    }
  });
}

export function updatePackage(req: auth.AuthRequest, res: express.Response): void {
  let name: string = req.params.package;
  let authFile = getAuth();
  let user: any = auth.getUserByToken(res.locals.remote_user.token, authFile);
  let request = req.headers.referer.split(' ');
  if (request[0] === 'star') {
    let username = user.name;
    if (username in req.body.users) {
      auth.starPackage(user.name, name, authFile).then((newAuthFile) => {
        if (!newAuthFile) {
            return res.status(403).json({ error: `you do not have permission to star `
                + `"${name}". Are you logged in as the correct user?` });
          } else {
            writeJsonFile(getAuthPath(), newAuthFile).then(() => {
              return res.status(200).json({ message: 'Package starred.' });
            });
          }
      });
    } else {
      auth.unStarPackage(user.name, name, authFile).then((newAuthFile) => {
        if (!newAuthFile) {
            return res.status(403).json({ error: `you do not have permission to star `
                + `"${name}". Are you logged in as the correct user?` });
          } else {
            writeJsonFile(getAuthPath(), newAuthFile).then(() => {
              return res.status(200).json({ message: 'Package unstarred.' });
            });
          }
      });
    }
  } else if (request[0] === 'deprecate') {
    if (request.length > 1) {
      let pkg = request[1];
      if (pkg === '[REDACTED]') {
        pkg = req.body.name;
      }
      let message = request.splice(2).join(' ');
      let authFile = getAuth();
      let user = auth.getUserByToken(res.locals.remote_user.token, authFile);
      auth.userHasWritePermissions(user.name, pkg, authFile)
        .then(hasPermission => {
          if (hasPermission) {
            let pkgJsonPath = getFilePath(`packages/${pkg}/package.json`);
            if (pkg.indexOf('@') !== -1) {
              pkg = pkg.replace(/^(@.*)(\/)(.*)$/, '$1%2F$3');
            }

            exists(pkgJsonPath).then(e => {
              if (e) {
                readJsonFile(pkgJsonPath)
                  .then((jsonData: IPackage) => {
                    Object.keys(jsonData.versions).forEach(key => {
                      jsonData.versions[key]['deprecated'] = message;
                    });
                    writeJsonFile(pkgJsonPath, jsonData);
                    return res.status(200).json({ message: 'success' });
                  });
              } else {
                return res.status(404).json({});
              }
            }).catch(() => res.status(404).json({}));
          } else {
            return res.status(403).json({ error: `you do not have permission to deprecate `
              + `"${pkg}". Are you logged in as the correct user?` });
          }
        });
    } else {
      res.status(412).json({ error: 'Parameters missing.' });
    }
  } else {
    let jsonErrorResponse: any = { error: 'error saving package version' };
    let organization: string = null;
    let teams: any = null;
    if (name[0] === '@') {
      let splitName = name.split('/')[0].slice(1);
      if (splitName !== user.name) {
        organization = splitName;
        teams = auth.getUserTeams(user.name, organization, authFile).map(t => {
          return { team: t.name, read: true, write: true };
        });
      }
    }
    let data: IPackage = req.body;
    let version: string = data.versions[Object.keys(data.versions)[0]].version;

    auth.publishPackage(
      name, user.name, organization, teams, version, authFile).then((newAuthFile) => {
        if (!newAuthFile) {
          return res.status(403).json({ error: `you do not have permission to publish `
              + `"${name}". Are you logged in as the correct user?` });
        } else {
          writeJsonFile(getAuthPath(), newAuthFile).then(() => {
            let pkg = new Package(data);
            pkg.saveTarballFromData()
              .then(() => pkg.initPkgJsonFromData())
              .then(() => {
                return res.status(200).json({ message: 'package published' });
              })
              .catch(err => {
                return res.status(500).json(jsonErrorResponse);
              });
          });
        }
    }).catch(error => res.status(error.errorCode).json({ error: error.errorMessage}));
  }
}

export function whoami(req: auth.AuthRequest, res: express.Response): express.Response {
  return res.status(200).json({ username: res.locals.remote_user.name });
}

export function ping(req: auth.AuthRequest, res: express.Response): express.Response {
  return res.status(200).json({ success: true });
}

export function starredByUser(req: auth.AuthRequest, res: express.Response): express.Response {
  let request = req.headers.referer.split(' ');
  let authFile = getAuth();
  let username: string;
  if (request.length > 1) {
    username = request[1];
  } else {
    let user = auth.getUserByToken(res.locals.remote_user.token, authFile);
    username = user.name;
  }
  auth.getStaredPackages(username, authFile).then(starredPackages => {
    return res.status(200).json({ rows: starredPackages.map(sp => { return {value: sp}; })});
  });

  return res.status(200);
 }

export function organizationAccess(req: auth.AuthRequest, res: express.Response): express.Response {
  let request = req.headers.referer.split(' ');
  let authFile = getAuth();
  let searchPattern: any;
  if (request.length > 1) {
    if (request[1] === 'ls-packages') {
      if (request.length > 2) {
        searchPattern = request[2];
      } else {
        searchPattern = res.locals.remote_user.name;
      }

      auth.lsPackages(searchPattern, authFile).then(packages => {
        return res.status(200).json(packages);
      }).catch(error => res.status(error.errorCode).json({ error: error.errorMessage}));
    }
  }

  return res.status(200);
}

export function setOrganizationAccess(req: auth.AuthRequest, res: express.Response): void {
  let request = req.headers.referer.split(' ');
  let authFile = getAuth();
  if (request.length > 2) {
    if (request[1] === 'grant') {
      if (request.length > 4) {
        let permission = request[2];
        let team = request[3];
        let pkg = request[4];
        if (request[4] === '[REDACTED]') {
          pkg = req.body.package;
        }
        auth.grantAccess(pkg, team, permission, res.locals.remote_user.name, authFile)
        .then(newAuthFile => {
          if (newAuthFile) {
            writeJsonFile(getAuthPath(), newAuthFile).then(() => {
              res.status(200).json({ message: 'Permission granted.' });
            });
          }
        }).catch(error => res.status(error.errorCode).json({ error: error.errorMessage}));
      }
    } else if (request[1] === 'revoke') {
      if (request.length > 3) {
        let team = request[2];
        let pkg = request[3];
        if (request[3] === '[REDACTED]') {
          pkg = req.body.package;
        }
        auth.revokeAccess(pkg, team, res.locals.remote_user.name, authFile)
        .then(newAuthFile => {
          if (newAuthFile) {
            writeJsonFile(getAuthPath(), newAuthFile).then(() => {
              res.status(200).json({ message: 'Permission revoked.' });
            });
          }
        }).catch(error => res.status(error.errorCode).json({ error: error.errorMessage}));
      }
    }
  }
}

export function getCollaborators(req: auth.AuthRequest, res: express.Response): express.Response {
  let request = req.headers.referer.split(' ');
  let authFile = getAuth();
  let searchPattern = '';
  if (request.length > 2) {
    if (request[1] === 'ls-collaborators') {
      let pkgName = request[2];
      if (request[2] === '[REDACTED]') {
        pkgName = req.params[0].split('/');
        pkgName = `${pkgName[2]}/${pkgName[3]}`;
      }
      if (request.length > 3) {
        searchPattern = request[3];
      }

      auth.lsCollaborators(pkgName, searchPattern, authFile).then(collaborators => {
        return res.status(200).json(collaborators);
      }).catch(error => res.status(500));
    }
  }

  return res.status(200);
}

export function setPackageAccess(req: auth.AuthRequest, res: express.Response): void {
  let request = req.headers.referer.split(' ');
  let authFile = getAuth();
  let pkg = req.params[0];
  if (request.length > 1) {
    if (request[0] === 'access') {
      if (request[1] === 'public') {
        auth.packagePublicAccess(pkg, res.locals.remote_user.name, authFile)
        .then(newAuthFile => {
          if (newAuthFile) {
            writeJsonFile(getAuthPath(), newAuthFile).then(() => {
              res.status(200).json({ message: 'Package access set to public!' });
            });
          }
        }).catch(error => res.status(error.errorCode).json({ error: error.errorMessage}));
      } else if (request[1] === 'restricted') {
        auth.packageRestrictedAccess(pkg, res.locals.remote_user.name, authFile)
        .then(newAuthFile => {
          if (newAuthFile) {
            writeJsonFile(getAuthPath(), newAuthFile).then(() => {
              res.status(200).json({ message: 'Package access set to restricted!' });
            });
          }
        }).catch(error => res.status(error.errorCode).json({ error: error.errorMessage}));
      }
    }
  }
}

export function search(req: auth.AuthRequest, res: express.Response): void {
  let text = req.query.text;
  let size = req.query.size || 20;

  let packages = storage.map(pkg => {
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

