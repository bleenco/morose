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
  let org = auth.organizations.find(o => o.name === organization);
  if (org) {
    return org.teams.filter(t => t.members.findIndex(m => m === username) !== -1).map(t => t.name);
  }
  return [];
}

export function getTeamUsers(team: string, organization: string, auth: any): any {
  let users = [];
  let org = auth.organizations.find(o => o.name === organization);
  if (org) {
    org.teams.filter(t => t.team === team).members.forEach(m => {
      if (!users[m]) {
        users.push(m);
      }
    });
  }
  return users;
}

export function checkPackageName(pkgName: string): boolean {
  let regexStart = /^[a-z0-9()'!*@,;+-]{1}/g;
  let regexWord = /^[a-z0-9._()'!*@,;+-/]{1,213}$/g;
  return regexStart.test(pkgName) && regexWord.test(pkgName);
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
    if (checkPackageName(pkgName)) {
      return userHasWritePermissions(username, pkgName, auth).then(hasPermission => {
        return new Promise((resolve, reject) => {
          if (hasPermission) {
            getPackage(pkgName, auth).then(pkgObject => {
              if (pkgObject) {
                if (pkgObject.versions.indexOf(version) === -1) {
                  pkgObject.versions.push(version);
                  resolve(auth);
                } else {
                  reject({ errorCode: 412,
                    errorMessage: `Error: Specified version of this package was already published!`
                  });
                }
              } else {
                let permissions = [];
                if (teamPermissions) {
                  permissions = teamPermissions.map(
                    tp => ({ team: tp.team, read: tp.read, write: tp.write}));
                }
                let pkg: any = {
                  name: pkgName,
                  versions: [ version ],
                  owners: [ username ],
                  organization: organization ? organization : '',
                  teamPermissions: permissions,
                  memberPermissions: [{ name: username, read: true, write: true }],
                  stars: []
                };
                if (organization) {
                  pkg.access = 'restricted';
                }
                if (auth.packages
                .findIndex(p => p.name === pkgName && p.version === version) === -1) {
                  auth.packages.push(pkg);
                  resolve(auth);
                } else {
                  reject({ errorCode: 412,
                    errorMessage: `Error: Specified version of this package was already published!`
                  });
                }
              }
            });
          } else {
            resolve(false);
          }
        });
      });
    } else {
      Promise.reject({ errorCode: 412,
            errorMessage: `Error: Package name is not in a correct format!` });
    }
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

export function getStaredPackages(username: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let starredPackages: any = auth.packages.filter(p => p.stars.indexOf(username) !== -1);
    if (starredPackages) {
      resolve(starredPackages.map(p => p.name));
    } else {
      reject();
    }
  });
 }

export function userHasReadPermissions(username: string, pkg: string, auth: any): Promise<boolean> {
  return getPackage(pkg, auth).then(pkgObject => {
    if (pkgObject && pkgObject.name[0] === '@') {
      if (pkgObject.access === 'restricted') {
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
            if (organizations.findIndex(o => o.name === splitName) !== -1) {
              return true;
            }
          }
        }
      } else {
        return true;
      }

      return false;
    });
}

export function lsPackages(pattern: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let user = auth.users.find(u => u.name === pattern);
    let result = {};
    if (user) {
      // user is owner
      let packages = auth.packages.filter(p => p.owners.findIndex(o => o === user.name) !== -1)
        .map(p => p.name);
      if (packages) {
        packages.forEach(pkg => result[pkg] = 'write');
      }

      // user has member permissions
      auth.packages.forEach(p => {
        let memberPermission = p.memberPermissions.find(mp => mp.name === pattern);
        if (memberPermission) {
          if (memberPermission.write) {
            result[p.name] = 'write';
          } else if (!result[p.name] && memberPermission.read) {
            result[p.name] = 'read';
          }
        }
      });

      // user is in the team that has permissions
      let organizations = getUserOrganizations(pattern, auth);
      organizations.forEach(o => {
        let teams = getUserTeams(pattern, o, auth);
        let packages = auth.packages.filter(p => p.organization === o.name);
        packages.forEach(p => {
          let teamPermissions = p.teamPermissions.filter(tp => tp.team in teams);
          teamPermissions.forEach(tp => {
            if (tp.write) {
              result[p.name] = 'write';
            } else if (!result[p.name] && tp.read) {
              result[p.name] = 'read';
            }
          });
        });
      });
      resolve(result);
    } else {
      let splitPattern = pattern.split(':');
      if (splitPattern.length > 1) {
        if (auth.organizations.findIndex(o => o.name === splitPattern[0]) !== -1) {
          let packages = auth.packages.filter(p => p.organization === splitPattern[0]);
          if (packages) {
            packages.forEach(pkg => {
              let teamPermission = pkg.teamPermissions.find(tp => tp.team === splitPattern[1]);
              if (teamPermission) {
                // team has permissions
                if (teamPermission.write) {
                  result[pkg.name] = 'write';
                } else if (teamPermission.read) {
                  result[pkg.name] = 'read';
                }
              }
            });
          }
          resolve(result);
        } else {
          reject({ errorCode: 412,
            errorMessage: `Error: Organization ${splitPattern[0]} does not exists` });
        }
      } else {
        // organization is owner
        if (auth.organizations.findIndex(o => o.name === pattern) !== -1) {
          let packages = auth.packages.filter(p => p.organization === pattern).map(p => p.name);
          if (packages) {
            packages.forEach(pkg => result[pkg] = 'write');
          }
          resolve(result);
        } else {
          reject({ errorCode: 412,
            errorMessage: `Error: Organization ${splitPattern[0]} does not exists` });
        }
      }
    }
  });
}

export function lsCollaborators(pkg: string, username: string, auth: any): Promise<any> {
  return new Promise((resolve) => {
    let result = {};
    getPackage(pkg, auth).then(p => {
      if (p) {
        let teams = [];
        if (username) {
          teams = getUserTeams(username, p.organization, auth);
          p.owners.forEach(o => {
            let ownerTeams = getUserTeams(o, p.organization, auth);
            ownerTeams.some(ot => {
              if (teams.findIndex(t => t === ot) !== -1) {
                result[o] = 'write';
              }
            });
            result[o] = 'write';
          });
          p.teamPermissions.forEach(tp => {
            if (teams.findIndex(t => t === tp.team) !== -1) {
              let users = getTeamUsers(tp.team, p.organization, auth);
              if (tp.write) {
                users.forEach(u => result[u] = 'write');
              } else if (tp.read) {
                users.forEach(u => {
                  if (!result[u]) {
                    result[tp.team] = 'read';
                  }
                });
              }
            }
          });
          p.memberPermissions.forEach(mp => {
            if (!result[mp.name]) {
              let memberTeams = getUserTeams(mp.name, p.organization, auth);
              memberTeams.some(mt => {
                if (teams.findIndex(t => t === mt) !== -1) {
                  if (mp.write) {
                    result[mp.name] = 'write';
                  } else if (mp.read) {
                    result[mp.name] = 'read';
                  }
                }
              });
            }
          });
        } else {
          p.owners.forEach(o => result[o] = 'write');
          p.teamPermissions.forEach(tp => {
            let users = getTeamUsers(tp.team, p.organization, auth);
            if (tp.write) {
              users.forEach(u => result[u] = 'write');
            } else if (tp.read) {
              users.forEach(u => {
                if (!result[u]) {
                  result[tp.team] = 'read';
                }
              });
            }
          });
          p.memberPermissions.forEach(mp => {
            if (!result[mp.name]) {
              if (mp.write) {
                result[mp.name] = 'write';
              } else if (mp.read) {
                result[mp.name] = 'read';
              }
            }
          });
        }
      }
      resolve(result);
    });
  });
}

export function grantAccess(
  pkg: string, team: string, permission: string, user: string, auth: any): Promise<any> {
    return new Promise((resolve, reject) => {
      return userHasWritePermissions(user, pkg, auth).then(hasPermission => {
        if (hasPermission) {
          if (['read-only', 'read-write'].indexOf(permission) !== -1) {
            let pkgObject = auth.packages.find(p => p.name === pkg);
            if (pkgObject) {
              let teamPermissionIndex = pkgObject.teamPermissions.findIndex(tp => tp.team === team);
              if (teamPermissionIndex !== -1) {
                pkgObject.teamPermissions.splice(teamPermissionIndex, 1);
              }
              pkgObject.teamPermissions.push(
                { team: team, read: true, write: permission === 'read-write' ? true : false });
            }
            resolve(auth);
          } else {
            reject({ errorCode: 412,
              errorMessage: `Error: permission has to be either read-only or read-write.` });
          }
        } else {
          reject({ errorCode: 403, errorMessage: `You do not have permission to grant `
          + `permissions for "${pkg}". Are you logged in as the correct user?` });
        }
      }).catch(() => {
        reject({ errorCode: 403, errorMessage: `You do not have permission to grant permissions `
          + `for "${pkg}". Are you logged in as the correct user?` });
      });
    });
}

export function revokeAccess(pkg: string, team: string, user: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    return userHasWritePermissions(user, pkg, auth).then(hasPermission => {
      if (hasPermission) {
        let pkgObject = auth.packages.find(p => p.name === pkg);
        if (pkgObject) {
          let teamPermissionIndex = pkgObject.teamPermissions.findIndex(tp => tp.team === team);
          if (teamPermissionIndex !== -1) {
            pkgObject.teamPermissions.splice(teamPermissionIndex, 1);
          }
        }
        resolve(auth);
      }
      reject({ errorCode: 403, errorMessage: `You do not have permission to revoke permissions `
        + `for "${pkg}". Are you logged in as the correct user?` });
    }).catch(() => {
      reject({ errorCode: 403, errorMessage: `You do not have permission to revoke permissions `
        + `for "${pkg}". Are you logged in as the correct user?` });
    });
  });
}

export function packagePublicAccess(pkg: string, user: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    return userHasWritePermissions(user, pkg, auth).then(hasPermission => {
      if (hasPermission) {
        let pkgObject = auth.packages.find(p => p.name === pkg);
        if (pkgObject) {
          pkgObject.access = 'public';
          resolve(auth);
        } else {
          reject({ errorCode: 412, errorMessage: `Package "${pkg}" doesn't exists!` });
        }
      }
      reject({ errorCode: 403, errorMessage: `You do not have permission to change access `
        + `for "${pkg}". Are you logged in as the correct user?` });
    }).catch(() => {
      reject({ errorCode: 403, errorMessage: `You do not have permission to change access `
        + `for "${pkg}". Are you logged in as the correct user?` });
    });
  });
}

export function packageRestrictedAccess(pkg: string, user: string, auth: any): Promise<any> {
  return new Promise((resolve, reject) => {
    return userHasWritePermissions(user, pkg, auth).then(hasPermission => {
      if (hasPermission) {
        let pkgObject = auth.packages.find(p => p.name === pkg);
        if (pkgObject) {
          pkgObject.access = 'restricted';
          resolve(auth);
        } else {
          reject({ errorCode: 412, errorMessage: `Package "${pkg}" doesn't exists!` });
        }
      }
      reject({ errorCode: 403, errorMessage: `You do not have permission to change access `
        + `for "${pkg}". Are you logged in as the correct user?` });
    }).catch(() => {
      reject({ errorCode: 403, errorMessage: `You do not have permission to change access `
        + `for "${pkg}". Are you logged in as the correct user?` });
    });
  });
}
