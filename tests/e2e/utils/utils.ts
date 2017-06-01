import * as fs from '../utils/fs';

export function createPackageJson(
  filePath: string, pkgName: string, version: string): Promise<null> {
    let pkgJson = {
      name: pkgName,
      version: version,
      description: 'dummy package',
      main: 'index.js',
      scripts: {},
      author: 'admin',
      license: '',
      dependencies: {}
    };

    return fs.writeJsonFile(filePath, pkgJson);
}
