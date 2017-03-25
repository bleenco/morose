import { INpmPackage, Package } from './package';
import { readDir } from './fs';
import { getFilePath } from './utils';
import { info } from './logger';

export interface IStorage {
  packages: INpmPackage[]
}

export let storage: IStorage = {
  packages: []
};

export function initializeStorage(): Promise<null> {
  let rootDir = getFilePath('packages');
  let startTime: number = new Date().getTime();

  return readDir(rootDir)
    .then(packages => {
      return Promise.all(packages.map(packageName => {
        let pkg: Package = new Package({ name: packageName });

        return pkg.inititialize().then(() => {
          let pkgData = pkg.getPackageData();
          storage.packages.push(pkgData);
        });
      })).then(() => {
        let time = new Date().getTime() - startTime;
        info(`storage initialized in ${time}ms`);
      });
    })
    .catch(err => console.error(err));
}

export function updatePkgStorage(pkgName: string, data: INpmPackage): void {
  let index = storage.packages.findIndex(pkg => pkg.name === pkgName);
  storage.packages[index] = data;
}

export function findPackage(pkgName: string): INpmPackage | null {
  let index = storage.packages.findIndex(pkg => pkg.name === pkgName);
  return storage.packages[index] || null;
}
