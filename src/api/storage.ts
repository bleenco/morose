import { INpmPackage, Package } from './package';
import { readDir, globSearch } from './fs';
import { getFilePath } from './utils';
import { info } from './logger';

export interface IStorage {
  packages: INpmPackage[];
}

export let storage: IStorage = {
  packages: []
};

export function initializeStorage(): Promise<null> {
  let rootDir = getFilePath('packages');
  let startTime: number = new Date().getTime();

  return globSearch(`${rootDir}/**/package.json`)
    .then(packages => {
      return Promise.all(packages.map(packageUrl => {
        let packageName: string | string[] = packageUrl.replace(/(.*)packages\//, '').split('/');
        packageName = packageName
          .filter((str, i) => i === 0 || (i === 1 && packageName[0].startsWith('@')))
          .join('/');

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

export function updatePkgStorage(pkgName: string, data: INpmPackage): Promise<null> {
  let index = storage.packages.findIndex(pkg => pkg && pkg.name === pkgName);
  if (index !== -1) {
    storage.packages[index] = data;
    return Promise.resolve(null);
  } else {
    let pkg: Package = new Package({ name: pkgName });
    return pkg.inititialize().then(() => {
      let pkgData = pkg.getPackageData();
      storage.packages.push(pkgData);
    });
  }
}

export function findPackage(pkgName: string): INpmPackage | null {
  let index = storage.packages.findIndex(pkg => pkg && pkg.name === pkgName);
  return storage.packages[index] || null;
}
