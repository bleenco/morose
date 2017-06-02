import { homedir } from 'os';
import { resolve, join } from 'path';
import { readFile, writeFile, exists, writeJsonFile } from './fs';
import * as fs from 'fs';
import * as logger from './logger';
import { generateHash } from './auth';

let home = homedir();

export function setHomeDir(path: string) {
  home = path;
}

export function getRootDir(): string {
  return home;
}

export function getConfigPath(): string {
  return join(getRootDir(), 'config.json');
}

export function getAuthPath(): string {
  return join(getRootDir(), 'auth.json');
}

export function getConfig(): any {
  let configPath = getConfigPath();
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export function getAuth(): any {
  let path = getAuthPath();
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function getFilePath(relativePath: string): string {
  return join(getRootDir(), relativePath);
}

export function writeInitConfig(): Promise<null> {
  let secret = Math.random().toString(36).substr(2, 10);

  let data = {
    port: 10000,
    ssl: false,
    secret: secret,
    upstream: 'https://registry.npmjs.org',
    useUpstream: true,
    saveUpstreamPackages: true
  };

  return writeJsonFile(getConfigPath(), data).then(() => writeAuth(secret));
}

export function writeAuth(secret: string): Promise<null> {
  let password = 'admin';
  let data = {
    organizations: [
      {
        name: 'bleenco',
        teams: [ { name: 'developers', members: [ 'admin' ] } ],
        members: [ { name: 'admin', role: 'owner' } ]
      }
    ],
    users: [
      {
        name: 'admin', password: generateHash(password, secret), fullName: '', email: '', tokens: []
      }
    ],
    packages: []
  };

  logger.info(`initializing \`admin\` user with password \`${password}\``);
  return writeJsonFile(getAuthPath(), data);
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getHumanSize(bytes: number, decimals = 2): string {
  if (!bytes) {
    return '0 Bytes';
  }

  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1000;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
