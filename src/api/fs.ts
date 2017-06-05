import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as utils from './utils';
import { dirname } from 'path';
import * as glob from 'glob';

export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });
}

export function writeFile(filePath: string, data: string): Promise<null> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'utf8', (err: NodeJS.ErrnoException) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function writeBufferToFile(filePath: string, data: Buffer): Promise<null> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err: NodeJS.ErrnoException) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function ensureDirectory(dirPath: string): Promise<null> {
  return new Promise((resolve, reject) => {
    fse.ensureDir(dirPath, (err: Error) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function readDir(dirPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err: NodeJS.ErrnoException, files: string[]) => {
      if (err) {
        reject(err);
      }

      resolve(files);
    });
  });
}

export function globSearch(globString: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(globString, (err: Error, matches: string[]) => {
      if (err) {
        reject(err);
      }

      resolve(matches);
    });
  });
}

export function writeJsonFile(filePath: string, data: any = {}): Promise<null> {
  return writeFile(filePath, JSON.stringify(data, null, 2));
}

export function readJsonFile(filePath: string): Promise<any> {
  return readFile(filePath).then(data => JSON.parse(data));
}

export function existsSync(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function exists(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.exists(filePath, (exists: boolean) => resolve(exists));
  });
}

export function removeFile(filePath: string): Promise<null> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err: NodeJS.ErrnoException) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function removeFolder(path: string): Promise<null> {
  return new Promise((resolve, reject) => {
    fs.rmdir(path, (err: NodeJS.ErrnoException) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function writeTarball(packageName: string, attachments: any): Promise<null> {
  let name = Object.keys(attachments)[0];
  let destFile = utils.getFilePath(`tarballs/${packageName}/${name}`);

  return ensureDirectory(dirname(destFile))
    .then(() => {
      let buf = Buffer.from(attachments[name].data, 'base64');
      return writeBufferToFile(destFile, buf);
    });
}
