import { expect } from 'chai';
import * as fs from '../../src/api/fs';
import * as auth from '../../src/api/auth';
import { resolve } from 'path';

let testPath = resolve(__dirname, 'test2.json');
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
        { name: 'admin', password: 12345, fullName: '' },
        { name: 'developer', password: 12345, fullName: '' }
      ],
      packages: [
        {
          name: 'morose',
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ 'admin' ],
          organization: '',
          teamPermissions: [],
          memberPermissions: [{ name: 'admin', read: true, write: true }],
          stars: [ 'developer' ]
        }
      ]
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
      = [{ team: 'testTeam', read: true, write: true }];

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
          memberPermissions: [{ name: username, read: true, write: true }],
          stars: []
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
          memberPermissions: [{ name: username, read: true, write: true }],
          stars: []
        });
      });
  });

  it('should put a star on a package', () => {
    let pkgName = 'morose';
    let username = 'admin';

    return auth.starPackage(username, pkgName, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkgName,
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ username ],
          organization: '',
          teamPermissions: [],
          memberPermissions: [{ name: username, read: true, write: true }],
          stars: [ 'developer', username ]
        });
      });
  });

  it('should remove a star from a package', () => {
    let pkgName = 'morose';
    let username = 'admin';

    return auth.unStarPackage(username, pkgName, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkgName,
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ username ],
          organization: '',
          teamPermissions: [],
          memberPermissions: [{ name: username, read: true, write: true }],
          stars: [ 'developer' ]
        });
      });
  });

  it('should put a star on package and then removes it', () => {
    let pkgName = 'morose';
    let username = 'admin';

    return auth.starPackage(username, pkgName, testAuth).then(starredAuth => {
      return auth.unStarPackage(username, pkgName, starredAuth).then(unStarredAuthentication => {
        return fs.writeJsonFile(testPath, unStarredAuthentication).then(() => {
          return fs.readJsonFile(testPath).then(content => {
            expect(content.packages).to.deep.include({
              name: pkgName,
              versions: [ '0.8.1', '0.8.2' ],
              owners: [ username ],
              organization: '',
              teamPermissions: [],
              memberPermissions: [{ name: username, read: true, write: true }],
              stars: [ 'developer' ]
            });
          });
        });
      });
    });
  });

  it('should list all packages user has a star on it', () => {
    let username = 'developer';

    return auth.getStaredPackages(username, testAuth).then(starredPackages => {
      expect(starredPackages).to.deep.include('morose');
    });
  });
});
