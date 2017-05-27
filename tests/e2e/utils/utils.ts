import * as fs from '../utils/fs';

export function createPackageJson(filePath: string): Promise<null> {
  let pkgJson = {
    name: 'test-package',
    version: '0.0.1',
    description: 'dummy package',
    main: 'index.js',
    scripts: {},
    author: 'admin',
    license: '',
    dependencies: {}
  };

  return fs.writeFile(filePath, JSON.stringify(pkgJson, null, 2));
}
