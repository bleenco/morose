import * as crypto from 'crypto';
import * as express from 'express';
import { getConfig, getAuth, getAuthPath } from './utils';
import { writeJsonFile } from './fs';

export interface AuthRequest extends express.Request {
  remote_user: any;
  headers: {
    authorization: any,
    referer: string
  };
}

export interface IUserBasic {
  name: string;
  password: string;
}

export interface IUser extends IUserBasic {
  _id: string;
  email: string;
  type: string;
  roles: string[];
  date: Date;
}

export interface UserData {
  name: string;
  fullName: string;
  email: string;
  password: string;
}

export interface OrganizationTeamData {
  username: string;
  organization: string;
  team: string;
}

export interface TeamPermissionData {
  team: string;
  read: boolean;
  write: boolean;
}

export function middleware(req: AuthRequest, res: express.Response,
  next: express.NextFunction): void {
  if (res.locals.remote_user != null && res.locals.remote_user.name !== 'anonymous') {
    return next();
  }

  res.locals.remote_user = anonymousUser();
  if (typeof req.headers.authorization === 'undefined') {
    return next();
  }

  let authorization = req.headers.authorization && req.headers.authorization.split(' ');
  if (authorization.length !== 2) {
    res.status(400).send('bad authorization header.');
  }

  if (authorization[0] !== 'Bearer') {
    return next();
  }

  let token = authorization[1];
  let user;

  try {
    user = aesDecrypt(token).toString().split(':');
    res.locals.remote_user = authenticatedUser(user[0], []);
    res.locals.remote_user.token = token;
  } catch (e) { }

  return next();
}

export function getUserByToken(token: string, auth: any): any {
  let user = auth.users.find(u => u.tokens.findIndex(t => t === token) !== -1);
  if (user) {
    return user;
  } else {
    return false;
  }
}

export function getUserByUsername(username: string, auth: any): any {
  let user = auth.users.find(u => u.name === username);
  if (user) {
    return user;
  } else {
    return false;
  }
}

export function getUserOrganizations(username: string, auth: any): any {
  return auth.organizations.filter(o => o.members.findIndex(m => m.name === username) !== -1);
}

export function getUserTeams(username: string, organization: string, auth: any): any {
  return auth.organizations.find(o => o.name = organization).teams
    .filter(t => t.members.findIndex(m => m === username) !== -1);
}

export function hasAccess(req: AuthRequest, res: express.Response,
  next: express.NextFunction): void | express.Response {
    if (getUserByToken(res.locals.remote_user.token, getAuth())) {
      next();
    } else {
      return res.status(401).json({ error: 'Not authorized!' });
    }
}

export function login(user: IUserBasic): Promise<number> {
  return new Promise((resolve, reject) => {
    let config = getConfig();
    let auth = getAuth();
    let hash = generateHash(user.password, config.secret);
    let index = auth.users.findIndex(u => u.name === user.name && u.password === hash);
    if (index !== -1) {
      resolve(index);
    } else {
      reject();
    }
  });
}

export function logout(token: string): Promise<null> {
  let auth = getAuth();
  let i = auth.users.reduce((acc, curr, i) => {
    return acc.concat(curr.tokens.map(token => { return { index: i, token: token }; }));
  }, []).find(u => u.token === token);

  if (i) {
    let name = auth.users[i.index].name;
    auth.users[i.index].tokens =
      auth.users[i.index].tokens.filter(t => t !== token);
    return writeJsonFile(getAuthPath(), auth).then(() => name);
  } else {
    return Promise.reject('user or token not found');
  }
}

export function aesEncrypt(buf: Buffer): string {
  let config = getConfig();
  let cipher: crypto.Cipher = crypto.createCipher('aes192', config.secret);
  let encrypted = cipher.update(buf, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function aesDecrypt(encrypted: string): string {
  let config = getConfig();
  let decipher = crypto.createDecipher('aes192', config.secret);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function generateHash(password: string, secret?: string): string {
  let code: string;

  if (!secret) {
    let config = getConfig();
    code = config.secret;
  } else {
    code = secret;
  }

  return crypto.createHash('md5').update(`${password}${code}`).digest('hex');
}

export function checkUser(username: string, password: string): boolean {
  let auth = getAuth();
  let hash = generateHash(password);
  let index = auth.users.findIndex(u => u.name === username && u.password === hash);

  return index !== -1 ? true : false;
}

function anonymousUser(): any {
  return { name: 'anonymous', groups: ['&all', '$anonymous'], real_groups: [] };
}

function authenticatedUser(name: string, groups: string[] = []): any {
  return { name: name, groups: groups.concat(['&all', '$anonymous']), real_groups: groups };
}

export function newUser(data: UserData, auth: any, config: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let { name, fullName, email, password } = data;
    let hash = generateHash(password, config.secret);
    let user = {
      name: name,
      password: hash,
      fullName: fullName,
      email: email,
      tokens: []
    };
    if (!getUserByUsername(name, auth)) {
      auth.users.push(user);
      resolve(auth);
    } else {
      reject();
    }
  });
}

export function newOrganization(
  organization: string, username: string, auth: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let org = {
        name: organization,
        teams: [{ name: 'developers', members: [username] }],
        members: [{ name: username, role: 'owner' }],
        packages: []
      };
      let index = auth.organizations.findIndex(org => org.name === organization);
      if (index === -1) {
        auth.organizations.push(org);
        resolve(auth);
      } else {
        reject();
      }
    });
}

export function newTeam(data: OrganizationTeamData, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let { username, team, organization } = data;
    let teamObject = {
      name: team,
      members: [ username ]
    };
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    if (orgIndex !== -1) {
      let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === team);
      if (teamIndex === -1) {
        auth.organizations[orgIndex].teams.push(teamObject);
        resolve(auth);
      } else {
        reject();
      }
    } else {
      reject();
    }
  });
}

export function addUserToOrganization(
  username: string, organization: string, role: string, auth: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let member = {
        name: username,
        role: role
      };
      let orgIndex = auth.organizations.findIndex(org => org.name === organization);
      if (orgIndex !== -1) {
        let memberIndex = auth.organizations[orgIndex].members.findIndex(m => m.name === username);
        if (memberIndex === -1) {
          let developersTeamIndex = auth.organizations[orgIndex].teams
            .findIndex(team => team.name === 'developers');
          auth.organizations[orgIndex].members.push(member);
          if (developersTeamIndex !== -1) {
            auth.organizations[orgIndex].teams[developersTeamIndex].members.push(username);
            resolve(auth);
          } else {
            reject();
          }
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
}

export function addUserToTeam(data: OrganizationTeamData, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let { username, team, organization } = data;
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    if (orgIndex !== -1) {
      let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === team);
      if (teamIndex !== -1) {
        let memberIndex = auth.organizations[orgIndex].teams[teamIndex].members
          .findIndex(m => m === username);
        if (memberIndex === -1) {
          auth.organizations[orgIndex].teams[teamIndex].members.push(username);
          resolve(auth);
        } else {
          reject();
        }
      } else {
        reject();
      }
    } else {
      reject();
    }
  });
}

export function deleteTeam(team: string, organization: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    if (orgIndex !== -1) {
      let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === team);
      if (teamIndex !== -1) {
        auth.organizations[orgIndex].teams.splice(teamIndex, 1);
        resolve(auth);
      }
    }
  });
}

export function deleteUserFromTeam(data: OrganizationTeamData, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let { username, team, organization } = data;
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    if (orgIndex !== -1) {
      let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === team);
      if (teamIndex !== -1) {
        let userIndex = auth.organizations[orgIndex].teams[teamIndex]
          .members.findIndex(u => u === username);
        if (userIndex !== -1) {
          auth.organizations[orgIndex].teams[teamIndex].members.splice(userIndex, 1);
          resolve(auth);
        } else {
          reject();
        }
      } else {
        reject();
      }
    } else {
      reject();
    }
  });
}

export function deleteUserFromOrganization(
  username: string, organization: string, auth: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let orgIndex = auth.organizations.findIndex(org => org.name === organization);
      if (orgIndex !== -1) {
        let usrIndex = auth.organizations[orgIndex].members.findIndex(u => u.name === username);
        if (usrIndex !== -1) {
          auth.organizations[orgIndex].members.splice(usrIndex, 1);
          resolve(auth);
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
}

export function deleteOrganization(organization: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let index = auth.organizations.findIndex(org => org.name === organization);
    auth.organizations.splice(index, 1);
    resolve(auth);
  });
}

export function changeUserRole(
  username: string, organization: string, role: string, auth: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let orgIndex = auth.organizations.findIndex(org => org.name === organization);

      if (orgIndex !== -1) {
        let usrIndex = auth.organizations[orgIndex].members.findIndex(u => u.name === username);
        if (usrIndex !== -1) {
          auth.organizations[orgIndex].members[usrIndex].role = role;
          resolve(auth);
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
}

export function publishPackage(
  pkgName: string, username: string, organization: string,
  teamPermissions: TeamPermissionData[], version: string, auth: any): Promise<any> {
    return userHasWritePermissions(username, pkgName, auth).then(hasPermission => {
      return new Promise((resolve, reject) => {
        if (hasPermission) {
          getPackage(pkgName, auth).then(pkgObject => {
            if (pkgObject) {
              if (pkgObject.versions.indexOf(version) === -1) {
                pkgObject.versions.push(version);
                resolve(auth);
              } else {
                reject();
              }
            } else {
              let permissions = [];
              if (teamPermissions) {
                permissions = teamPermissions.map(
                  tp => ({ team: tp.team, read: tp.read, write: tp.write}));
              }
              let pkg = {
                name: pkgName,
                versions: [ version ],
                owners: [ username ],
                organization: organization ? organization : '',
                teamPermissions: permissions,
                memberPermissions: [{ name: username, read: true, write: true }],
                stars: []
              };
              if (auth.packages
              .findIndex(p => p.name === pkgName && p.version === version) === -1) {
                auth.packages.push(pkg);
                resolve(auth);
              } else {
                reject();
              }
            }
          });
        } else {
          resolve(false);
        }
      });
    });
}

export function starPackage(username: string, pkg: string, auth: any): Promise<any> {
  return userHasReadPermissions(username, pkg, auth).then(hasPermission => {
    return new Promise((resolve, reject) => {
      if (hasPermission) {
        getPackage(pkg, auth).then(pkgObject => {
          if (pkgObject) {
            if (pkgObject.stars.indexOf(username) === -1) {
              pkgObject.stars.push(username);
              resolve(auth);
            } else {
              resolve(auth);
            }
          } else {
            reject();
          }
        });
      } else {
        resolve(false);
      }
    });
  });
}

export function unStarPackage(username: string, pkg: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    getPackage(pkg, auth).then(pkgObject => {
      if (pkgObject) {
        let starIndex = pkgObject.stars.indexOf(username);
        if (starIndex !== -1) {
          pkgObject.stars.splice(starIndex, 1);
          resolve(auth);
        } else {
          resolve(auth);
        }
      } else {
        reject();
      }
    });
  });
}

export function getPackage(pkg: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let pkgObject = auth.packages.find(p => p.name === pkg);
    if (pkgObject) {
      resolve(pkgObject);
    } else {
      resolve(false);
    }
  });
}

export function userHasReadPermissions(username: string, pkg: string, auth: any): Promise<boolean> {
  return getPackage(pkg, auth).then(pkgObject => {
    if (pkgObject && pkgObject.name[0] === '@') {
      if (pkgObject.owners.findIndex(o => o === username) !== -1) {
        return true;
      } else {
        if (pkgObject.memberPermissions.findIndex(mp => mp.name === username && mp.read) !== -1) {
          return true;
        } else {
          let teams = getUserTeams(username, pkgObject.name, auth);
          teams.forEach(t => {
            if (pkgObject.teamPermissions.findIndex(tp => tp.team === t.name && tp.read) !== -1) {
              return true;
            }
          });
          return false;
        }
      }
    }
    return true;
  });
}

export function userHasWritePermissions(
  username: string, pkg: string, auth: any): Promise<boolean> {
    return getPackage(pkg, auth).then(pkgObject => {
      if (pkg[0] === '@') {
        if (pkgObject) {
          if (pkgObject.owners.findIndex(o => o === username) !== -1) {
            return true;
          } else {
            if (pkgObject.memberPermissions.findIndex(
              mp => mp.name === username && mp.write) !== -1) {
              return true;
            } else {
              let teams = getUserTeams(username, pkgObject.name, auth);
              return teams.some(t => {
                if (pkgObject.teamPermissions.findIndex(
                  tp => tp.team === t.name && tp.write) !== -1) {
                  return true;
                }
              });
            }
          }
        } else {
          let splitName = pkg.split('/')[0].slice(1);
          if (splitName === username) {
            return true;
          } else {
            let organizations = getUserOrganizations(username, auth);
            if (organizations.indexOf(o => o.name === splitName) !== -1) {
              return true;
            } else {
              return false;
            }
          }
        }
      } else {
        return true;
      }
    });
}
