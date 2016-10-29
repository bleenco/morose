import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';

export function writeFile(file: string, buf: BufferSource): Observable<any> {
  return new Observable(observer => {
    fs.writeFile(file, buf, err => {
      if (err) {
        observer.error(err);
        observer.complete();
      }

      observer.next(`[${chalk.green('✔')}] ${file} saved.`);
      observer.complete();
    });
  });
}

export function makeTmpDirectory(rootDir: string): Observable<any> {
  return new Observable(observer => {
    let dir = path.join(rootDir, 'tmp', rand());
    fs.ensureDir(dir, err => {
      if (err) { 
        observer.error(err);
        observer.complete();
      }

      observer.next(dir);
      observer.complete();
    });
  });
}

export function rand(): string {
  return Math.random().toString(36).substring(7);
}

export function prepareRootDirectory(dir: string): Observable<any> {
  return makeDirectory(dir, 'tmp')
    .concat(makeDirectory(dir, 'packages'))
    .concat(makeDirectory(dir, 'json'));
}

function makeDirectory(dir: string, name: string): Observable<any> {
  return new Observable(observer => {
    let directoryPath = path.join(dir, name);
    if (fs.existsSync(directoryPath)) {
      observer.complete();
    }
    
    fs.ensureDir(directoryPath, err => {
      if (err) {
        observer.error(err);
        observer.complete();
      }

      observer.next(`[${chalk.green('✔')}] ${directoryPath} created.`);
      observer.complete();
    });
  });
}
