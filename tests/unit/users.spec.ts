import { expect, should } from 'chai';
import * as fs from '../../src/api/fs';
import * as auth from '../../src/api/auth';
import { resolve } from 'path';

let testPath = resolve(__dirname, 'test.json');
let testAuth: any;
let testConfig = {
  port: 10000,
  secret: '8kjsi3tb2r'
};

describe('User roles, affiliation and permission specific tests', () => {

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

  it('should add new user with correct data', () => {
    let userData = {
      name: 'John',
      fullName: 'John White',
      email: 'john.white@gmail.com',
      password: 'johnwhitewhitejohn911',
      tokens: []
    };

    return auth.newUser(userData, testAuth, testConfig)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
          userData.password = auth.generateHash('johnwhitewhitejohn911', testConfig.secret);
          expect(content.users).to.deep.include(userData);
      });
  });

  it('should add new organization with correct data', () => {
    let organization = 'testOrganization';
    let username = 'testAdmin';

    return auth.newOrganization(organization, username, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.organizations).to.deep.include({
          name: 'testOrganization',
          teams: [ { name: 'developers', members: [ 'testAdmin' ] } ],
          members: [ { name: 'testAdmin', role: 'owner' } ],
          packages: []
        });
      });
  });

  it('should add new team with correct data', () => {
    let teamData = {
      username: 'admin',
      organization: 'bleenco',
      team: 'testTeam'
    };

    return auth.newTeam(teamData, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.organizations[0].teams).to.deep.include({
          name: 'testTeam', members: [ 'admin' ]
        });
      });
  });

  it('should add a new user to organization', () => {
    let username = 'John';
    let organization = 'bleenco';
    let role = 'member';

    return auth.addUserToOrganization(username, organization, role, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.organizations[0].members).to.deep.include({ name: 'John', role: 'member' });
      });
  });

  it('should add a new user to team', () => {
    let data = {
      username: 'admin',
      organization: 'bleenco',
      team: 'developers'
    };

    return auth.addUserToTeam(data, testAuth).catch(error => {
      expect(error);
    });
  });

  it('should delete team', () => {
    let team = 'developers';
    let organization = 'bleenco';

    return auth.deleteTeam(team, organization, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => { expect(content.organizations[0].teams.length).equal(0); });
  });

  it('should delete user from team', () => {
    let teamData = {
      username: 'admin',
      organization: 'bleenco',
      team: 'developers'
    };

    return auth.deleteUserFromTeam(teamData, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => {
        expect(content.organizations[0].teams[0].members.length).equal(0);
      });
  });

  it('should delete user from organization', () => {
    let username = 'admin';
    let organization = 'bleenco';

    return auth.deleteUserFromOrganization(username, organization, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => { expect(content.organizations[0].members.length).equal(0); });
  });

  it('should delete organization', () => {
    let organization = 'bleenco';

    return auth.deleteOrganization(organization, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => { expect(content.organizations.length).equal(0); });
  });

  it('should change user role', () => {
    let organization = 'bleenco';
    let username = 'admin';
    let role = 'member';

    return auth.changeUserRole(username, organization, role, testAuth)
      .then(authentication => fs.writeJsonFile(testPath, authentication))
      .then(() => fs.readJsonFile(testPath))
      .then(content => { expect(content.organizations[0].members[0].role).equal('member'); });
  });

});
