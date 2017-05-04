import { getFilePath } from './utils';
import { join } from 'path';
import {
  ensureDirectory,
  readJsonFile,
  writeTarball,
  exists
} from './fs';

export interface IPackage {
  _id: string;
  _rev: string;
  name: string;
  description: string;
  'dist-tags': { [tag: string]: string };
  versions: {
    [version: string]: {
      name: string;
      version: string;
      description: string;
      main: string;
      scripts: { [script: string]: string };
      repository: { type: string; url: string; };
      keywords: string[];
      author: { name: string; email: string; };
      licence: string;
      bugs: { url: string; }
      homepage: string;
      dependencies: { [dep: string]: string; };
      os: string[];
      gypfile: boolean;
      gitHead: string;
      _id: string;
      _from: string;
      _npmVersion: string;
      _nodeVersion: string;
      _npmUser: { name: string; email: string; };
      dist: { shasum: string; tarball: string };
      maintainers: { name: string; email: string; }[];
      directories: { };
    }
  };
  readme: string;
  maintainers: { name: string; email: string; }[];
  time: { [version: string]: string; };
  homepage: string;
  keywords: string[];
  repository: { type: string; url: string; };
  author: { name: string; email: string; };
  licence: string;
  bugs: { url: string; };
  readmeFilename: string;
  users: { [user: string]: boolean };
  _attachments: { };
}


export class Package {
  data: IPackage;
  packageRoot: string;
  tarballRoot: string;
  pkgJsonPath: string;

  constructor(data?: IPackage, name?: string) {
    if (data) {
      this.data = data;
      this.packageRoot = getFilePath(`packages/${this.data.name}`);
      this.tarballRoot = getFilePath(`tarballs/${this.data.name}`);
    }

    if (name) {
      this.packageRoot = getFilePath(`packages/${name}`);
      this.tarballRoot = getFilePath(`tarballs/${name}`);
    }

    this.pkgJsonPath = join(this.packageRoot, 'package.json');
  }

  init(): Promise<null> {
    return this.ensureRootFolders()
      .then(() => this.initDataFromPkgJson());
  }

  getData(): Promise<IPackage> {
    if (!this.data) {
      return this.initDataFromPkgJson()
        .then(() => this.data);
    } else {
      return Promise.resolve(this.data);
    }
  }

  initDataFromPkgJson(): Promise<null> {
    return readJsonFile(this.pkgJsonPath)
      .then((jsonData: IPackage) => this.data = jsonData)
      .catch(err => console.error(err));
  }

  saveTarballFromData(): Promise<null> {
    return this.ensureRootFolders()
      .then(() => {
        let latestVersion = this.data['dist-tags'].latest;
        let tarballPath = this.tarballRoot + '/' + this.data.name + '-' + latestVersion + '.tgz';
        return exists(tarballPath).then(e => {
          if (e) {
            return Promise.resolve();
          } else {
            return writeTarball(this.data.name, this.data._attachments);
          }
        });
      });
  }

  private ensureRootFolders(): Promise<null> {
    return ensureDirectory(this.packageRoot)
      .then(() => ensureDirectory(this.tarballRoot))
      .catch(err => console.error(err));
  }
}
