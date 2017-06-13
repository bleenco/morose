import { IPackage, Package } from './package';
import { readDir, globSearch, readJsonFile } from './fs';
import { getFilePath, getRandomInt, getAuth } from './utils';
import { info } from './logger';
import { resolve } from 'path';
import { userHasReadPermissions } from './auth';

export let storage: IPackage[] = [];

export function initializeStorage(): Promise<null> {
  let rootDir = getFilePath('packages');
  let startTime: number = new Date().getTime();

  return globSearch(`${rootDir}/**/package.json`)
    .then(packages => {
      return Promise.all(packages.map(jsonPath => {
        return readJsonFile(jsonPath).then((pkgJsonData: IPackage) => {
          storage.push(pkgJsonData);
        });
      })).then(() => {
        let time = new Date().getTime() - startTime;
        info(`storage initialized in ${time}ms`);
      });
    })
    .catch(err => console.error(err));
}

export function updatePkgStorage(pkgName: string): Promise<null> {
  let pkg = new Package(null, pkgName);
  return pkg.initDataFromPkgJson();
}

export function findPackage(pkgName: string): IPackage | null {
  let index = storage.findIndex(pkg => pkg.name === pkgName);
  return storage[index] || null;
}

export function deletePackage(pkgName: string): void {
  let index = storage.findIndex(pkg => pkg.name === pkgName);
  if (index !== -1) {
    storage.splice(index, 1);
  }
}

export function deletePackageVersion(pkgName: string, version: string): void {
  let index = storage.findIndex(pkg => pkg.name === pkgName);
  if (index !== -1) {
    delete storage[index].versions[version];
  }
}

export function addPackage(pkg: IPackage): void {
  let index = storage.findIndex(p => p.name === pkg.name);
  if (index !== -1) {
    storage[index] = pkg;
  } else {
    storage.push(pkg);
  }
}

export async function getRandomPackage(username: string) {
  let index = getRandomInt(0, storage.length - 1);
  let auth = getAuth();
  let permission = await userHasReadPermissions(username, storage[index].name, auth);
  console.log('krneki');
  console.log(permission);
  if (permission) {
    return storage[index];
  } else {
    return null;
  }
}
