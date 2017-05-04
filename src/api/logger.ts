import * as express from 'express';
import * as chalk from 'chalk';
import * as auth from './auth';
import * as request from 'request';

export function middleware(req: auth.AuthRequest, res: express.Response,
  next: express.NextFunction): void {
  let time = `[${chalk.blue(getDateTime())}]`;
  let method = `[${chalk.green('HTTP')}] [${chalk.green('<-')}] ` +
    `${chalk.yellow(res.statusCode.toString())} ${req.method}`;
  let url = `${req.originalUrl}`;
  let name = res.locals.remote_user && res.locals.remote_user.name || 'anonymous';
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let userInfo = `${name}${chalk.yellow('@')}${ip}`;

  console.log(`${time} ${method} ${url} - ${userInfo}`);
  next();
}

export function httpIn(url: string, method: string, res: request.RequestResponse): void {
  let statusCode = res && res.statusCode ? res.statusCode.toString() : '200';
  let time = `[${chalk.blue(getDateTime())}]`;
  let httpMethod = `[${chalk.cyan('HTTP')}] [${chalk.cyan('<-')}] ` +
    `${chalk.yellow(statusCode)} ${method}`;

  console.log(`${time} ${httpMethod} ${url}`);
}

export function httpOut(url: string, method: string, statusCode: string): void {
  let time = `[${chalk.blue(getDateTime())}]`;
  let httpMethod = `[${chalk.green('HTTP')}] [${chalk.green('->')}] ` +
    `${chalk.yellow(statusCode)} ${method}`;

  console.log(`${time} ${httpMethod} ${url}`);
}

export function info(msg: string): void {
  let time = `[${chalk.blue(getDateTime())}]`;
  let method = `[${chalk.yellow('INFO')}] [${chalk.yellow('--')}]`;
  console.log(`${time} ${method} ${msg}`);
}

function getDateTime(): string {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
