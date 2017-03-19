import * as express from 'express';
import * as chalk from 'chalk';
import * as auth from './auth';

export function middleware(req: auth.AuthRequest, res: express.Response, next: express.NextFunction): void {
  let time: string = `[${chalk.blue(getDateTime())}]`;
  let method: string = `[${chalk.yellow('HTTP')}] [${chalk.green('<-')}] ${chalk.green(res.statusCode.toString())} ${req.method}`;
  let url: string = `${req.originalUrl}`;
  let name: string = res.locals.remote_user && res.locals.remote_user.name || 'anonymous';
  let userInfo: string = `${name}${chalk.yellow('@')}${req.ip}`;

  console.log(`${time} ${method} ${url} - ${userInfo}`);
  next();
}

export function info(msg: string): void {
  let time: string = `[${chalk.blue(getDateTime())}]`;
  let method: string = `[${chalk.yellow('INFO')}] [${chalk.green('--')}]`;
  console.log(`${time} ${method} ${msg}`);
}

function getDateTime(): string {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
