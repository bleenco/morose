import { expect } from 'chai';
import * as fs from '../../src/api/fs';
import * as auth from '../../src/api/auth';
import { resolve } from 'path';

let testPath = resolve(__dirname, 'test.json');
let testAuth: any;

describe('Publishing packages specific tests', () => {

  beforeEach(() => {
    testAuth = {
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
    let teamPermissions: auth.TeamPermissionData[]
      = [{ team: 'testTeam', permission: 'read-write' }];

    return auth.publishPackage(pkgName, username, organization, teamPermissions, version, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkgName,
          versions: [ version ],
          owners: [ username ],
          organization: organization,
          teamPermissions: teamPermissions,
          memberPermissions: [{ name: username, permission: 'read-write' }]
        });
      });
  });

  it('should publish a new public package with correct data', () => {
    let pkgName = 'testPackage';
    let username = 'admin';
    let organization = null;
    let version = '0.1.2';
    let teamPermissions = null;

    return auth.publishPackage(pkgName, username, organization, teamPermissions, version, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkgName,
          versions: [ version ],
          owners: [ username ],
          organization: '',
          teamPermissions: [],
          memberPermissions: [{ name: username, permission: 'read-write' }]
        });
      });
  });
});
