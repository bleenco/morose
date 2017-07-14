import { getFilePath } from './utils';
import { join } from 'path';
import {
  ensureDirectory,
  readJsonFile,
  writeTarball,
  writeJsonFile,
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

  init(): Promise<void | IPackage> {
    return this.ensureRootFolders()
      .then(() => this.initDataFromPkgJson());
  }

  private prepareData(data: IPackage): IPackage {
    if (!data.time) {
      data.time = { modified: new Date().toISOString(), created: new Date().toISOString() };
    }
    Object.keys(data.versions).forEach(key => {
      if (!(key in data.time)) {
        data.time[key] = new Date().toISOString();
      }
    });
    return data;
  }

  getData(): Promise<IPackage> {
    if (!this.data) {
      return this.initDataFromPkgJson()
        .then(() => this.data);
    } else {
      return Promise.resolve(this.data);
    }
  }

  initDataFromPkgJson(): Promise<void | IPackage> {
    return readJsonFile(this.pkgJsonPath)
      .then((jsonData: IPackage) => this.data = jsonData)
      .catch(err => console.error(err));
  }

  initPkgJsonFromData(): Promise<null> {
    let data = this.data;
    data._attachments = {};
    return  this.ensureRootFolders()
      .then(() => exists(this.pkgJsonPath))
      .then(oldVersionExists => {
        if (oldVersionExists) {
          return readJsonFile(this.pkgJsonPath)
            .then((jsonData: IPackage) => {
              if (jsonData) {
                data.time = jsonData.time;
                data = this.prepareData(data);
                Object.keys(jsonData.versions).forEach(v => {
                  if (!data.versions[v]) {
                    data.versions[v] = jsonData.versions[v];
                  }
                });
              }
              return writeJsonFile(this.pkgJsonPath, data);
            });
        } else {
          return writeJsonFile(this.pkgJsonPath, this.prepareData(data));
        }
      });
  }

  saveTarballFromData(): Promise<null> {
    return this.ensureRootFolders()
      .then(() => {
        let latestVersion = this.data['dist-tags'].latest;
        let tarballPath = this.tarballRoot + '/' + this.data.name + '-' + latestVersion + '.tgz';
        return writeTarball(this.data.name, this.data._attachments);
      });
  }

  private ensureRootFolders(): Promise<void> {
    return ensureDirectory(this.packageRoot)
      .then(() => ensureDirectory(this.tarballRoot))
      .catch(err => console.error(err));
  }
}
