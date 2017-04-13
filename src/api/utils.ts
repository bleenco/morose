import { homedir } from 'os';
import { resolve, join } from 'path';
import { readFile, writeFile, exists, writeJsonFile } from './fs';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as logger from './logger';
import { generateHash } from './auth';

export function getRootDir(): string {
  return join(homedir(), '.morose');
}

export function getConfigPath(): string {
  return join(getRootDir(), 'config.json');
}

export function getConfig(): any {
  let configPath = getConfigPath();
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export function getFilePath(relativePath: string): string {
  return join(getRootDir(), relativePath);
}

export function writeInitConfig(): Promise<null> {
  let password = Math.random().toString(36).substr(2, 5);
  let secret = Math.random().toString(36).substr(2, 10);

  let data = {
    port: 10000,
    ssl: false,
    sslKey: null,
    sslCert: null,
    wsPort: 10001,
    secret: secret,
    users: [
      { name: 'admin', password: generateHash(password, secret), fullName: '' }
    ],
    upstreams: ['https://registry.npmjs.org'],
    saveUpstreamPackages: false
  };

  logger.info(`initializing \`admin\` user with password \`${password}\``);
  return writeJsonFile(getConfigPath(), data);
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
