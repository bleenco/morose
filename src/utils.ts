import { homedir } from 'os';
import { resolve, join } from 'path';
import { readFile, writeFile, exists, writeJsonFile } from './fs';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as logger from './logger';

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
  let hash = crypto.createHash('md5').update(password).digest('hex');

  let data = {
    port: 10000,
    secret: Math.random().toString(36).substr(2, 10),
    users: [
      { name: 'admin', password: hash }
    ],
    upstreams: ['https://registry.npmjs.org']
  };

  logger.info(`initializing \`admin\` user with password \`${password}\``);
  return writeJsonFile(getConfigPath(), data);
}
