import * as fs from '../utils/fs';

export function createPackageJson(filePath: string, pkgName: string): Promise<null> {
  let pkgJson = {
    name: pkgName,
    version: '0.0.1',
    description: 'dummy package',
    main: 'index.js',
    scripts: {},
    author: 'admin',
    license: '',
    dependencies: {}
  };

  return fs.writeJsonFile(filePath, pkgJson);
}
