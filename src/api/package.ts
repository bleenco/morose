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

// export class Package {
//   data: IPackageData;
//   packageRoot: string;
//   tarballRoot: string;

//   constructor(data: IPackageData) {
//     this.data = data;
//     this.packageRoot = getFilePath(`packages/${this.data.name}`);
//     this.tarballRoot = getFilePath(`tarballs/${this.data.name}`);
//   }

//   inititialize(): Promise<null> {
//     return this.ensureRootFolders()
//       .then(() => this.initDataFromFiles());
//   }

//   getPackageData(): INpmPackage | null {
//     let versions = this.getVersions();
//     let latest = semverExtra.max(versions);
//     let latestData = this.data.metadata.versions[latest];

//     if (!latestData) {
//       return null;
//     }

//     return {
//       _id: latestData._id.split('@')[0],
//       name: latestData.name,
//       description: latestData.description,
//       'dist-tags': { latest: latestData.version },
//       versions: this.data.metadata.versions
//     };
//   }

//   getPackageDataForVersion(ver: string): IPackageVersionData | null {
//     let data = this.getPackageData();
//     return data.versions[ver] || null;
//   }

//   getLatestData(): Promise<IPackageMetadata | string[] | void> {
//     return readDir(this.packageRoot)
//       .then(versions => {
//         let latest = semver.maxSatisfying(versions, 'x.x.x');
//         let filePath = join(this.packageRoot, latest, 'package.json');

//         return readJsonFile(filePath)
//           .then((data: IPackageMetadata) => data)
//           .catch(err => console.error(err));
//       });
//   }

//   saveVersionFromMetadata(metadata: IPackageMetadata): Promise<null> {
//     let dirPath = join(this.packageRoot, metadata['dist-tags']['latest']);
//     let jsonPath = join(dirPath, 'package.json');

//     return ensureDirectory(dirPath)
//       .then(() => {
//         if (Object.keys(metadata._attachments).length) {
//           return writeTarball(this.data.name, metadata._attachments);
//         } else {
//           return Promise.resolve();
//         }
//       })
//       .then(() => {
//         delete metadata._attachments;
//         return writeJsonFile(jsonPath, metadata)
//           .then(() => {
//             this.addVersion(metadata);
//             updatePkgStorage(metadata.name, this.getPackageData());
//           });
//       })
//       .catch(err => console.error(err));
//   }

//   getVersions(): string[] {
//     this.data.metadata = this.data.metadata || {
//       name: this.data.name,
//       versions: {},
//       'dist-tags': {},
//       _attachments: {}
//     };

//     return Object.keys(this.data.metadata.versions);
//   }

//   versionExists(ver: string): boolean {
//     return typeof this.data.metadata.versions[ver] !== undefined;
//   }

//   private initDataFromFiles(): Promise<null> {
//     return readDir(this.packageRoot)
//       .then(versions => Promise.all(versions.map(ver => this.mergeData(ver))))
//       .catch(err => console.error(err));
//   }

//   private addVersion(metadata: IPackageMetadata): void {
//     this.data.metadata = this.data.metadata || {
//       name: this.data.name,
//       versions: {},
//       'dist-tags': {},
//       _attachments: {}
//     };

//     this.data.metadata.versions = Object.assign({},
//       this.data.metadata.versions, metadata.versions);
//   }

//   private mergeData(version: string): Promise<null> {
//     let versionRoot = join(this.packageRoot, version);
//     let versionFile = join(versionRoot, 'package.json');

//     if (!existsSync(versionFile)) {
//       return Promise.resolve();
//     }

//     return readJsonFile(versionFile)
//       .then((json: IPackageMetadata) => {
//         Object.keys(json.versions).forEach(ver => {
//           this.data.metadata = this.data.metadata || {
//             name: this.data.name,
//             versions: {},
//             'dist-tags': {},
//             _attachments: {}
//           };

//           this.data.metadata.versions[ver] = json.versions[ver];
//         });
//       })
//       .catch(err => console.error(err));
//   }

//   private ensureRootFolders(): Promise<null> {
//     return ensureDirectory(this.packageRoot)
//       .then(() => ensureDirectory(this.tarballRoot))
//       .catch(err => console.error(err));
//   }
// }
