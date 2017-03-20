import { Storage, IPackageJson } from './storage';

export interface IResponse {
  code: number;
  message: string;
}

export interface IPackage {
  name: string;
  metadata: any;
  storage: Storage;
  setVersion: (version: string) => void;
  existsSync: (exact: boolean) => boolean;
  setMetadata: (metadata: any) => void;
  setStorage: () => void;
  savePackage: () => Promise<IResponse>;
}

export class Package implements IPackage {
  name: string;
  metadata: any;
  version: string;
  storage: Storage;

  constructor(name: string) {
    this.name = name;
    this.setStorage();
  }

  setVersion(version: string): void {
    this.version = version;
  }

  existsSync(exact: boolean = false): boolean {
    return this.storage.existsSync(exact, this.version || null);
  }

  setMetadata(metadata: any): void {
    this.metadata = metadata;

    let packageJson: IPackageJson = {
      name: this.name,
      versions: this.metadata.versions,
      'dist-tags': this.metadata['dist-tags'],
      _attachments: this.metadata._attachments
    };

    this.storage.setJson(packageJson);
  }

  setStorage(): void {
    this.storage = new Storage(this.name);
  }

  savePackage(): Promise<IResponse> {
    return this.storage.addPackage();
  }

  getLatestPackage(): Promise<any> {
    return this.storage.getLatestData();
  }
}
