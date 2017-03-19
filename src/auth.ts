import * as crypto from 'crypto';
import * as express from 'express';

let config = { secret: '12312312312' };

export interface AuthRequest extends express.Request {
  remote_user: any;
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
  date: Date
}

export function middleware(req: AuthRequest, res: express.Response, next: express.NextFunction): void {
  if (req.remote_user != null && req.remote_user.name !== 'anonymous') {
    return next();
  }

  req.remote_user = anonymousUser();
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
  let user = aesDecrypt(token).toString().split(':');

  req.remote_user = authenticatedUser(user[0], []);
  req.remote_user.token = token;
  return next();
}

export function hasAccess(req: AuthRequest, res: express.Response, next: express.NextFunction): void {
  next();
}

export function login(user: IUserBasic): Promise<IUser> {
  return new Promise((resolve, reject) => {
    resolve(authenticatedUser(user.name));
  });
}

export function aesEncrypt(buf: Buffer): string {
  let cipher: crypto.Cipher = crypto.createCipher('aes192', config.secret);
  let encrypted = cipher.update(buf, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function aesDecrypt(encrypted: string): string {
  let decipher = crypto.createDecipher('aes192', config.secret);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function anonymousUser(): any {
  return { name: 'anonymous', groups: ['&all', '$anonymous'], real_groups: [] };
}

function authenticatedUser(name: string, groups: string[] = []): any {
  return { name: name, groups: groups.concat(['&all', '$anonymous']), real_groups: groups };
}
