import * as express from 'express';
import * as auth from './auth';
import * as logger from './logger';

export function doAuth(
  req: auth.AuthRequest,
  res: express.Response,
  next: express.NextFunction
): void {
  let token;

  if (req.body.name && req.body.password) {
    let buf = Buffer.from(`${req.body.name}:${req.body.password}`);
    token = auth.aesEncrypt(buf).toString();
  } else {
    token = null;
  }

  if (token) {
    res.status(201).json({ token: token });
  } else {
    res.status(401);
  }

  return next();
}

export function getPackage(req: auth.AuthRequest, res: express.Response): void {
  let packageName: string = req.params.package;
  let version: string | null = req.params.version || null;

  res.status(200).json({ ola: 'Halo!' });
}
