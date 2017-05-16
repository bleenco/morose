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
  permission: string;
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

export function hasAccess(req: AuthRequest, res: express.Response,
  next: express.NextFunction): void | express.Response {
    let auth = getAuth();
    let user = auth.users
      .find(u => u.tokens.findIndex(t => t === res.locals.remote_user.token) !== -1);
    if (user) {
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
    let index = auth.users.findIndex(u => u.name === name);
    if (index === -1) {
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
    return new Promise((resolve, reject) => {
      getPackage(pkgName, auth).then(pkgObject => {
        if (pkgObject) {
          if (isOwner(username, pkgName, auth)) {
            pkgObject.versions.push(version);
            resolve(auth);
          } else {
            reject();
          }
        } else {
          let permissions = [];
          if (teamPermissions) {
            permissions = teamPermissions.map(
              tp => ({ team: tp.team, permission: tp.permission}));
          }
          let pkg = {
            name: pkgName,
            versions: [ version ],
            owners: [ username ],
            organization: organization ? organization : '',
            teamPermissions: permissions,
            memberPermissions: [{ name: username, role: 'owner' }]
          };
          let pkgIndex = auth.packages.findIndex(p => p.name === pkgName && p.version === version);
          if (pkgIndex === -1) {
            auth.packages.push(pkg);
            resolve(auth);
          } else {
            reject();
          }
        }
      });
    });
}

export function isOwner(username: string, pkg: string, auth: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let pkgObject = auth.packages.find(p => p.name === pkg);
    if (pkgObject) {
      pkgObject.owners.find(u => u === username) ? resolve(true) : resolve(false);
    } else {
      reject();
    }
  });
}

export function getPackage(pkg: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let pkgObject = auth.packages.find(p => p.name === pkg);
    if (pkgObject) {
      resolve(pkgObject);
    } else {
      resolve();
    }
  });
}
