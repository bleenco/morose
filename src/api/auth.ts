import * as crypto from 'crypto';
import * as express from 'express';
import { getConfig, getAuth, getAuthPath } from './utils';
import { writeJsonFile } from './fs';

export interface AuthRequest extends express.Request {
  remote_user: any;
  headers: {
    authorization: any
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
  next: express.NextFunction): void {
  next();
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

export function newUser(data: UserData): Promise<string> {
  let { name, fullName, email, password } = data;
  let auth = getAuth();
  let config = getConfig();
  let user = {
    name: name,
    fullName: fullName,
    email: email,
    password: generateHash(password, config.secret)
  };
  let index = auth.users.findIndex(u => u.name === name);

  if (index === -1) {
    auth.users.push(user);
    return Promise.resolve(auth);
  } else {
    return Promise.reject('User with the same username allready exists.');
  }
}

export function newOrganization(req: express.Request, res: express.Response):
  express.Response | void {
    let name = req.body.organization;
    let username = req.body.username;
    let auth = getAuth();
    let organization = {
      name: name,
      teams: [{ name: 'developers', members: [username] }],
      members: [{ name: username, role: 'owner' }],
      packages: []
    };
    let index = auth.organizations.findIndex(org => org.name === name);
    if (index === -1) {
      auth.organizations.push(organization);
      writeJsonFile(getAuthPath(), auth).then(
        () => res.status(200).json({ success: 'Organization successfully added.' }));
    } else {
      return res.status(200).json({ warning: 'Organization with the same name allready exists.' });
    }
}

export function newTeam(req: express.Request, res: express.Response): express.Response | void {
  let teamName = req.body.team;
  let { organization, username } = req.body;
  let auth = getAuth();
  let team = {
    name: teamName,
    members: [ username ]
  };
  let orgIndex = auth.organizations.findIndex(org => org.name === organization);
  let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === teamName);

  if (teamIndex === -1) {
    auth.organizations[orgIndex].teams.push(team);
    writeJsonFile(getAuthPath(), auth).then(() => {
      res.status(200).json({ success: 'Team successfully added.' });
    });
  } else {
    return res.status(200).json({ warning: 'Team with the same name allready exists.' });
  }
}

export function addUserToOrganization(
  req: express.Request, res: express.Response): express.Response | void {
    let { organization, username, role } = req.body;
    let auth = getAuth();
    let member = {
      name: username,
      role: role
    };
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);

    let developersTeamIndex = auth.organizations[orgIndex].teams
      .findIndex(team => team.name === 'developers');
    let memberIndex = auth.organizations[orgIndex].members.findIndex(m => m.name === username);

    if (memberIndex === -1) {
      auth.organizations[orgIndex].members.push(member);
      if (developersTeamIndex !== -1) {
        auth.organizations[orgIndex].teams[developersTeamIndex].members.push(username);
        writeJsonFile(getAuthPath(), auth).then(
          () => res.status(200).json({ success: 'User successfully added to organization.'}));
      }
    } else {
      return res.status(200).json({ warning: 'User allready exists in the organization.' });
    }
}

export function addUserToTeam(
  req: express.Request, res: express.Response): express.Response | void {
    let { organization, username, team } = req.body;
    let auth = getAuth();
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === team);
    let memberIndex = auth.organizations[orgIndex].teams[teamIndex].members
      .findIndex(m => m === username);

    if (memberIndex === -1) {
      auth.organizations[orgIndex].teams[teamIndex].members.push(username);
      writeJsonFile(getAuthPath(), auth).then(() => {
        res.status(200).json({ success: 'User successfully added to team.' });
      });
    } else {
      return res.status(200).json({ warning: 'User allready exists in the team.' });
    }
}

export function deleteTeam(req: express.Request, res: express.Response): express.Response | void {
  let { team, organization } = req.body;
  let auth = getAuth();
  let orgIndex = auth.organizations.findIndex(org => org.name === organization);
  let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === team);

  if (orgIndex !== -1) {
    if (teamIndex !== -1) {
      auth.organizations[orgIndex].teams.splice(teamIndex, 1);
      writeJsonFile(getAuthPath(), auth).then(() => {
        res.status(200).json({ success: 'Team successfully deleted.' });
      });
    }
  }
}

export function deleteUserFromTeam(
  req: express.Request, res: express.Response): express.Response | void {
    let { username, team, organization } = req.body;
    let auth = getAuth();
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    let teamIndex = auth.organizations[orgIndex].teams.findIndex(t => t.name === team);
    let userIndex = auth.organizations[orgIndex].teams[teamIndex]
      .members.findIndex(u => u === username);
    auth.organizations[orgIndex].teams[teamIndex].members.splice(userIndex, 1);
    writeJsonFile(getAuthPath(), auth).then(() => {
      res.status(200).json({ success: 'User successfully deleted from a team.' });
    });
}

export function deleteUserFromOrganization(
  req: express.Request, res: express.Response): express.Response | void {
    let { username, organization } = req.body;
    let auth = getAuth();
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    let usrIndex = auth.organizations[orgIndex].members.findIndex(u => u.name === username);
    auth.organizations[orgIndex].members.splice(usrIndex, 1);
    writeJsonFile(getAuthPath(), auth).then(
      () => res.status(200).json({ success: 'User successfully deleted from an organization.' }));
}

export function deleteOrganization(
  req: express.Request, res: express.Response): express.Response | void {
    let organization = req.body.organization;
    let auth = getAuth();
    let index = auth.organizations.findIndex(org => org.name === organization);
    auth.organizations.splice(index, 1);
    writeJsonFile(getAuthPath(), auth).then(() => {
      res.status(200).json({ success: 'Organization successfully deleted.' });
    });
}

export function changeUserRole(
  req: express.Request, res: express.Response): express.Response | void {
    let { username, organization, role } = req.body;
    let auth = getAuth();
    let orgIndex = auth.organizations.findIndex(org => org.name === organization);
    let usrIndex = auth.organizations[orgIndex].members.findIndex(u => u.name === username);
    auth.organizations[orgIndex].members[usrIndex].role = role;
    writeJsonFile(getAuthPath(), auth).then(() => {
      res.status(200).json({ success: 'User role successfully updated.' });
    });
}

export function publishPackage(
  req: express.Request, res: express.Response): express.Response | void {
    let { name, username, organization, version } = req.body;
    let auth = getAuth();

    if (!organization) {
      let pkg = {
        name: name,
        version: version,
        teamPermissions: [],
        memberPermissions: [{ name: username, role: 'owner' }],
        owner: username
      };
      let pkgIndex = auth.packages.findIndex(p => p.name === name && p.version === version);

      if (pkgIndex === -1) {
        auth.packages.push(pkg);
        writeJsonFile(getAuthPath(), auth).then(() => {
          res.status(200).json({ success: 'Package successfully published.' });
        });
      } else {
        return res.status(200).json({
          warning: 'Package with specified name and version allready exists.' });
      }
    } else {
      let pkg = {
        name: name,
        version: version,
        owner: username
      };
      let orgIndex = auth.organizations.findIndex(org => org.name === organization);
      let pkgIndex = auth.organizations[orgIndex].packages
        .findIndex(p => p.name === name && p.version === version);

      if (pkgIndex === -1) {
        auth.organizations[orgIndex].packages.push(pkg);
        writeJsonFile(getAuthPath(), auth).then(() => {
          res.status(200).json({ success: 'Package successfully published.' });
        });
      } else {
        return res.status(200).json({
          warning: 'Package with specified name and version allready exists.' });
      }
    }
}
