import { getFilePath } from './utils';
import { join } from 'path';
import {
  ensureDirectory,
  readDir,
  readJsonFile,
  writeJsonFile,
  writeTarball,
  existsSync
} from './fs';
import * as semver from 'semver';

export interface IPackageVersions {
  [version: string]: {
    name: string;
    version: string;
    description: string;
    main: string;
    typings: string;
    scripts: { [script: string]: string },
    repository: { type: string; url: string; },
    keywords: string[],
    author: { name: string; email: string; },
    authors: string[],
    licence: string;
    bugs: { url: string; },
    homepage: string;
    readme: string;
    readmeFilename: string;
    gitHead: string;
    dependencies: { [dependency: string]: string; }
    devDependencies: { [dependency: string]: string; },
    _id: string;
    _shasum: string;
    _from: string;
    _npmVersion: string;
    _nodeVersion: string;
    _npmUser: any;
    dist: { shasum: string, tarball: string; }
  };
}

export interface IPackageMetadata {
  name: string;
  versions: IPackageVersions;
  'dist-tags': { [version: string]: string; };
  _attachments: {
    [attachment: string]: {
      content_type: string;
      data: string;
      length: number;
    }
  };
}

export interface IPackageData {
  name: string;
  metadata?: IPackageMetadata;
}

export interface INpmPackage {
  _id: string;
  name: string;
  description: string;
  'dist-tags': { [version: string]: string; };
  versions: IPackageVersions
}

export class Package {
  data: IPackageData;
  packageRoot: string;
  tarballRoot: string;

  constructor(data: IPackageData) {
    this.data = data;
    this.packageRoot = getFilePath(`packages/${this.data.name}`);
    this.tarballRoot = getFilePath(`tarballs/${this.data.name}`);
  }

  inititialize(): Promise<null> {
    return this.ensureRootFolders()
      .then(() => this.initDataFromFiles());
  }

  getPackageData(): INpmPackage {
    let versions = this.getVersions();
    let latest = semver.maxSatisfying(versions, 'x.x.x');
    let latestData = this.data.metadata.versions[latest];

    return {
      _id: latestData._id.split('@')[0],
      name: latestData.name,
      description: latestData.description,
      'dist-tags': { latest: latestData.version },
      versions: this.data.metadata.versions
    };
  }

  getLatestData(): Promise<IPackageMetadata | string[]> {
    return readDir(this.packageRoot)
      .then(versions => {
        let latest = semver.maxSatisfying(versions, 'x.x.x');
        let filePath = join(this.packageRoot, latest, 'package.json');

        return readJsonFile(filePath)
          .then((data: IPackageMetadata) => data)
          .catch(err => console.error(err));
      });
  }

  saveVersionFromMetadata(metadata: IPackageMetadata): Promise<null> {
    let dirPath = join(this.packageRoot, metadata['dist-tags'].latest);
    let jsonPath = join(dirPath, 'package.json');

    return ensureDirectory(dirPath)
      .then(() => writeTarball(metadata._attachments))
      .then(() => {
        delete metadata._attachments;
        return writeJsonFile(jsonPath, metadata);
      })
      .catch(err => console.error(err));
  }

  getVersions(): string[] {
    return Object.keys(this.data.metadata.versions);
  }

  versionExists(ver: string): boolean {
    return typeof this.data.metadata.versions[ver] !== undefined;
  }

  private initDataFromFiles(): Promise<null> {
    return readDir(this.packageRoot)
      .then(versions => Promise.all(versions.map(ver => this.mergeData(ver))))
      .catch(err => console.error(err));
  }

  private mergeData(version: string): Promise<null> {
    let versionRoot = join(this.packageRoot, version);
    let versionFile = join(versionRoot, 'package.json');

    if (!existsSync(versionFile)) {
      return Promise.resolve();
    }

    return readJsonFile(versionFile)
      .then((json: IPackageMetadata) => {
        Object.keys(json.versions).forEach(ver => {
          this.data.metadata = this.data.metadata || {
            name: this.data.name,
            versions: {},
            'dist-tags': {},
            _attachments: {}
          };

          this.data.metadata.versions[ver] = json.versions[ver];
        });
      })
      .catch(err => console.error(err));
  }

  private ensureRootFolders(): Promise<null> {
    return ensureDirectory(this.packageRoot)
      .then(() => ensureDirectory(this.tarballRoot))
      .catch(err => console.error(err));
  }
}
