import { homedir } from 'os';
import { resolve, join } from 'path';
import { readFile, writeFile, exists, writeJsonFile, ensureDirectory } from './fs';
import * as fs from 'fs';
import * as logger from './logger';
import { generateHash } from './auth';

let home = `${homedir()}/.morose`;

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
        name: 'admin',
        password: generateHash(password, secret),
        fullName: '',
        avatar: '/avatars/default.svg',
        role: 'admin',
        email: '',
        tokens: []
      }
    ],
    packages: []
  };

  logger.info(`initializing \`admin\` user with password \`${password}\``);

  let defaultAvatar =
    '<svg width="158px" height="164px" viewBox="0 0 158 164" version="1.1" ' +
    'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
    '<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">' +
    '<g transform="translate(-3.000000, 0.000000)" fill-rule="nonzero" fill="#000000">' +
    '<path d="M75.995,20.754 C68.234,42.212 49.636,39.183 48.028,55.447 C33.27,20.163 53.758,' +
    '0.695 79.088,0.325 C103.588,-0.033 122.909,17.407 113.428,55.357 C99.091,52.588 80.535,' +
    '34.964 75.995,20.754 L75.995,20.754 Z M160.287,154.55 C159.827,166.399 3.853,167.88 3.392,' +
    '154.55 C6.467,130.529 26.953,113.758 63.315,109.648 C64.693,127.277 97.007,128.881 99.362,' +
    '109.914 C123.157,113.681 157.97,126.282 160.287,154.55 Z" id="Shape"></path>' +
    '</g></g></svg>';

  return ensureDirectory(getFilePath('avatars'))
    .then(() => writeFile(getFilePath('avatars/default.svg'), defaultAvatar))
    .then(() => writeJsonFile(getAuthPath(), data));
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
