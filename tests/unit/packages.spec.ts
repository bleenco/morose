import { expect } from 'chai';
import * as fs from '../../src/api/fs';
import * as auth from '../../src/api/auth';
import { getConfig } from '../../src/api/utils';
import { resolve } from 'path';

let testPath = resolve(__dirname, 'test.json');
let testAuth = {
  organizations: [
    {
      name: 'bleenco',
      teams: [ { name: 'developers', members: [ 'admin' ] } ],
      members: [ { name: 'admin', role: 'owner' } ],
      packages: []
    }
  ],
  users: [
    { name: 'admin', password: 12345, fullName: '' }
  ],
  packages: []
};
let config = getConfig();

describe('Publishing packages specific tests', () => {

  beforeEach(() => {
    return fs.writeJsonFile(testPath, testAuth);
  });

  afterEach(() => {
    return fs.removeFile(testPath);
  });

  it('should publish a new private package with correct data', () => {
    let pkgName = 'testPackage';
    let username = 'admin';
    let organization = 'bleenco';
    let version = '0.1.2';

    return auth.publishPackage(pkgName, username, organization, version, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.organizations[0].packages).to.deep.include({
          name: pkgName,
          version: version,
          teamPermissions: [],
          memberPermissions: [{ name: username, role: 'owner' }],
          owner: username
        });
      });
  });

  it('should publish a new public package with correct data', () => {
    let pkgName = 'testPackage';
    let username = 'admin';
    let organization = null;
    let version = '0.1.2';

    return auth.publishPackage(pkgName, username, organization, version, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkgName, version: version, owner: username
        });
      });
  });
});
