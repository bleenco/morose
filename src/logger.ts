import * as express from 'express';
import * as chalk from 'chalk';
import * as auth from './auth';
import * as request from 'request';

export function middleware(req: auth.AuthRequest, res: express.Response, next: express.NextFunction): void {
  let time: string = `[${chalk.blue(getDateTime())}]`;
  let method: string = `[${chalk.green('HTTP')}] [${chalk.green('<-')}] ${chalk.white(res.statusCode.toString())} ${req.method}`;
  let url: string = `${req.originalUrl}`;
  let name: string = res.locals.remote_user && res.locals.remote_user.name || 'anonymous';
  let userInfo: string = `${name}${chalk.yellow('@')}${req.ip}`;

  console.log(`${time} ${method} ${url} - ${userInfo}`);
  next();
}

export function httpIn(url: string, method: string, res: request.RequestResponse): void {
  let time: string = `[${chalk.blue(getDateTime())}]`;
  let httpMethod: string = `[${chalk.cyan('HTTP')}] [${chalk.cyan('<-')}] ${chalk.white(res.statusCode.toString())} ${method}`;

  console.log(`${time} ${httpMethod} ${url}`);
}

export function httpOut(url: string, method: string): void {
  let time: string = `[${chalk.blue(getDateTime())}]`;
  let httpMethod: string = `[${chalk.green('HTTP')}] [${chalk.green('->')}] ${method}`;

  console.log(`${time} ${httpMethod} ${url}`);
}

export function info(msg: string): void {
  let time: string = `[${chalk.blue(getDateTime())}]`;
  let method: string = `[${chalk.yellow('INFO')}] [${chalk.yellow('--')}]`;
  console.log(`${time} ${method} ${msg}`);
}

function getDateTime(): string {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
