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
          teams: [ { name: 'developers', members: [ 'admin', 'manager' ] } ],
          members: [ { name: 'admin', role: 'owner' } ],
          packages: []
        }
      ],
      users: [
        { name: 'admin', password: 12345, fullName: '' },
        { name: 'developer', password: 12345, fullName: '' },
        { name: 'tester', password: 12345, fullName: '' },
        { name: 'manager', password: 12345, fullName: '' }
      ],
      packages: [
        {
          name: 'morose',
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ 'admin' ],
          organization: 'bleenco',
          teamPermissions: [{ team: 'developers', read: true, write: true }],
          memberPermissions: [
            { name: 'admin', read: true, write: true },
            { name: 'tester', read: true, write: true }
          ],
          tags: [],
          stars: [ 'developer' ]
        },
        {
          name: '@bleenco/package',
          versions: [ '0.8.1', '0.8.2' ],
          owners: [ 'admin' ],
          organization: 'bleenco',
          teamPermissions: [{ team: 'developers', read: true, write: true }],
          memberPermissions: [
            { name: 'admin', read: true, write: true },
            { name: 'tester', read: true, write: true }
          ],
          access: 'restricted',
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

  it('should accept write access for new unscoped package', () => {
    let pkgName = 'testpackage';
    let username = 'developer';

    return auth.userHasWritePermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(true));
  });

  it('should accept write access for new user scoped package', () => {
    let pkgName = '@developer/testpackage';
    let username = 'developer';

    return auth.userHasWritePermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(true));
  });

  it('should reject write access for scoped package', () => {
    let pkgName = '@bleenco/testpackage';
    let username = 'developer';

    return auth.userHasWritePermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(false));
  });

  it('should accept write access for scoped package because user is owner', () => {
    let pkgName = '@bleenco/testpackage';
    let username = 'admin';

    return auth.userHasWritePermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(true));
  });

  it('should accept write access for unscoped package because user is owner', () => {
    let pkgName = 'morose';
    let username = 'admin';

    return auth.userHasWritePermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(true));
  });

  it('should reject write access for unscoped package', () => {
    let pkgName = 'morose';
    let username = 'developer';

    return auth.userHasWritePermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(false));
  });

  it(`should accept write access for unscoped package because user has write permissions`,
    () => {
      let pkgName = 'morose';
      let username = 'tester';

      return auth.userHasWritePermissions(username, pkgName, testAuth)
        .then(permission => expect(permission).eql(true));
  });

  it(`should accept write access for unscoped package because user's team has write permissions`,
    () => {
      let pkgName = 'morose';
      let username = 'manager';

      return auth.userHasWritePermissions(username, pkgName, testAuth)
        .then(permission => expect(permission).eql(true));
  });

  it('should accept read access of public package', () => {
    let pkgName = 'morose';
    let username = 'developer';

    return auth.userHasReadPermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(true));
  });

  it('should reject read access of restricted package', () => {
    let pkgName = '@bleenco/package';
    let username = 'developer';

    return auth.userHasReadPermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(false));
  });

  it('should acccept read access of restricted package because user is owner', () => {
    let pkgName = '@bleenco/package';
    let username = 'admin';

    return auth.userHasReadPermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(true));
  });

  it('should acccept read access of restricted package because user has read permissions', () => {
    let pkgName = '@bleenco/package';
    let username = 'tester';

    return auth.userHasReadPermissions(username, pkgName, testAuth)
      .then(permission => expect(permission).eql(true));
  });

  it(`should acccept read access of restricted package because user's team has read permissions`,
    () => {
      let pkgName = '@bleenco/package';
      let username = 'manager';

      return auth.userHasReadPermissions(username, pkgName, testAuth)
        .then(permission => expect(permission).eql(true));
  });
});
