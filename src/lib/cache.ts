import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';
import { sha } from './utils';
import { Observable } from 'rxjs';

let cache: any = {};

export function initCache(rootDir: string): Observable<any> {
  return new Observable(observer => {
    let jsonDir = path.join(rootDir, 'json');
    fs.readdir(jsonDir, (err, files) => {
      if (err) {
        observer.error(err);
        observer.complete();
      }

      let fileObservables: Observable<any>[] = files.map(file => readJsonFile(jsonDir, file));
      Observable.merge(...fileObservables).subscribe(data => {
        addPackageToCache(data);
      }, err => {
        observer.error(err);
        observer.complete();
      }, () => {
        observer.next(`[${chalk.green('✔')}] Cache initialized.`);
        observer.complete();
      });
    });
  });
}

export function getCache(): any {
  return cache;
}

export function addPackageToCache(data: any): void {
  cache[data.name] = cache[data.name] || {};
  cache[data.name][data.version] = { file: data.path, checksum: data.sha, time: data.time };
}

function readJsonFile(jsonDir: string, jsonFile: string): Observable<any> {
  return new Observable(observer => {
    fs.readJson(path.join(jsonDir, jsonFile), (err, jsonData) => {
      if (err) {
        observer.error(err);
        observer.complete();      
      }

      observer.next(jsonData);
      observer.complete();
    });
  });
}
