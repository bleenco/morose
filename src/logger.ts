import * as express from 'express';
import * as chalk from 'chalk';

export function middleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
  let time: string = `[${chalk.blue(getDateTime())}]`;
  let method: string = `[${chalk.yellow('HTTP')}] [${chalk.green('<-')}] ${chalk.green(res.statusCode.toString())} ${req.method}`;
  let url: string = `${req.originalUrl}`

  console.log(`${time} ${method} ${url}`);
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
