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
          tags: [],
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
    let pkgName = 'testpackage';
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
          tags: [],
          stars: [],
          access: 'restricted'
        });
      });
  });

  it('should publish a new public package with correct data', () => {
    let pkgName = 'testpackage';
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
          tags: [],
          stars: []
        });
      });
  });

  it('should reject publish a new package with unvalid name', () => {
    let pkgName1 = 'testPackage';
    let pkgName2 = '.testpackage';
    let pkgName3 = '_testpackage';
    let pkgName4 = '';
    let pkgName5 = 'te`stpackage';
    let pkgName6 = 'testpackageaW';
    let pkgName7 = 'testpackagea:';
    let pkgName8 = 'test?packagea';
    let pkgName9 = 'test~packagea';

    return expect(auth.checkPackageName(pkgName1)
      || auth.checkPackageName(pkgName2)
      || auth.checkPackageName(pkgName3)
      || auth.checkPackageName(pkgName4)
      || auth.checkPackageName(pkgName5)
      || auth.checkPackageName(pkgName6)
      || auth.checkPackageName(pkgName7)
      || auth.checkPackageName(pkgName8)
      || auth.checkPackageName(pkgName9)).eql(false);
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
          tags: [],
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
          tags: [],
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
              tags: [],
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

  it('should list all packages user is able to access (npm access ls-packages).', () => {
    let username = 'admin';
    return auth.lsPackages(username, testAuth).then(packages => {
      expect(packages.morose).equal('write');
    });
  });

  it('should list all packages users team is able to access (npm access ls-packages).', () => {
    let team = 'bleenco:developers';
    return auth.lsPackages(team, testAuth).then(packages => {
      expect(packages).eql({});
    });
  });

  it('should list all access privileges for a package (npm access ls-collaborators).', () => {
    let pkg = 'morose';
    let username = 'admin';
    return auth.lsCollaborators(pkg, username, testAuth).then(collaborators => {
      expect(collaborators.admin).equal('write');
    });
  });

  it('should grant access for a package (npm access grant).', () => {
    let pkg = 'morose';
    let team = 'developers';
    let permission = 'read-write';
    let username = 'admin';
    return auth.grantAccess(pkg, team, permission, username, testAuth)
      .then(newAuth => fs.writeJsonFile(testPath, newAuth))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkg,
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ 'admin' ],
          organization: '',
          teamPermissions: [{ team: 'developers', read: true, write: true }],
          memberPermissions: [{ name: 'admin', read: true, write: true }],
          tags: [],
          stars: [ 'developer' ]
        });
      });
  });

  it('should revoke access for a package (npm access revoke).', () => {
    let pkg = 'morose';
    let team = 'bleenco:developers';
    let username = 'admin';

    return auth.grantAccess(pkg, team, 'read-write', username, testAuth).then(grantAuth => {
      return auth.revokeAccess(pkg, team, username, grantAuth).then(newAuth => {
        return fs.writeJsonFile(testPath, newAuth).then(() => {
          return fs.readJsonFile(testPath).then(content => {
            expect(content.packages).to.deep.include({
              name: pkg,
              versions: [ '0.8.1', '0.8.2' ],
              owners: [ 'admin' ],
              organization: '',
              teamPermissions: [],
              memberPermissions: [{ name: 'admin', read: true, write: true }],
              tags: [],
              stars: [ 'developer' ]
            });
          });
        });
      });
    });
  });

  it('should set package access to public (npm access public).', () => {
    let pkg = 'morose';
    let username = 'admin';
    return auth.packagePublicAccess(pkg, username, testAuth)
      .then(newAuth => fs.writeJsonFile(testPath, newAuth))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkg,
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ 'admin' ],
          organization: '',
          teamPermissions: [],
          memberPermissions: [{ name: 'admin', read: true, write: true }],
          tags: [],
          stars: [ 'developer' ],
          access: 'public'
        });
      });
  });

  it('should set package access to protected (npm access protected).', () => {
    let pkg = 'morose';
    let username = 'admin';
    return auth.packageRestrictedAccess(pkg, username, testAuth)
      .then(newAuth => fs.writeJsonFile(testPath, newAuth))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.packages).to.deep.include({
          name: pkg,
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ 'admin' ],
          organization: '',
          teamPermissions: [],
          memberPermissions: [{ name: 'admin', read: true, write: true }],
          tags: [],
          stars: [ 'developer' ],
          access: 'restricted'
        });
      });
  });
});
