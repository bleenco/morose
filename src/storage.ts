import * as fs from './fs';
import * as utils from './utils';
import { join } from 'path';
import * as semver from 'semver';

export interface IPackageJson {
  'name': string;
  'versions': any;
  'dist-tags': any;
  '_attachments': {
    [name: string]: {
      'content_type': string;
      'data': Blob;
      'length': number;
    }
  };
}

export class Storage {
  name: string;
  rootDir: string;
  json: IPackageJson;

  constructor(name: string) {
    this.name = name;
    this.rootDir = utils.getFilePath('packages');
  }

  existsSync(exact: boolean = false, version: string | null): boolean {
    let checkPath: string;
    if (exact && version !== null) {
      checkPath = join(this.rootDir, this.name, version, 'package.json');
    } else {
      checkPath = join(this.rootDir, this.name);
    }

    return fs.existsSync(checkPath);
  }

  setJson(json: IPackageJson) {
    this.json = json;
  }

  getLatestData(): Promise<any> {
    return fs.readDir(join(this.rootDir, this.name)).then(versions => {
      let latest = semver.maxSatisfying(versions, 'x.x.x');
      let pkgJsonPath = join(this.rootDir, this.name, latest, 'package.json');
      return fs.readJsonFile(pkgJsonPath);
    });
  }

  addPackage(): Promise<null> {
    let dirPath = join(this.rootDir, this.json.name, this.json['dist-tags'].latest);
    let jsonPath = join(dirPath, 'package.json');

    return fs.ensureDirectory(dirPath)
      .then(() => fs.writeJsonFile(jsonPath, this.json))
      .then(() => fs.writeTarball(this.json._attachments));
  }
}

