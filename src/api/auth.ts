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
