import { expect, should } from 'chai';
import * as fs from '../../src/api/fs';
import * as auth from '../../src/api/auth';
import { getConfig } from '../../src/api/utils';
import { resolve } from 'path';

let testPath = resolve(__dirname, 'test.json');
let data = {
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

describe('User roles, affiliation and permission specific tests', () => {

  beforeEach(() => {
    return fs.writeJsonFile(testPath, data);
  });

  afterEach(() => {
    return fs.removeFile(testPath);
  });

  it('should add new user with correct data', () => {
    let userData = {
      name: 'John',
      fullName: 'John White',
      email: 'john.white@gmail.com',
      password: 'johnwhitewhitejohn911'
    };

    return auth.newUser(userData)
      .then(authentication => {
        return fs.writeJsonFile(testPath, authentication).then(() => {
          return fs.readJsonFile(testPath).then(content => {
            userData.password = auth.generateHash('johnwhitewhitejohn911', config.secret);
            expect(content.users).to.deep.include(userData);
          });
        });
      });
  });

});
