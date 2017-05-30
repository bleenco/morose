import * as fs from '../utils/fs';
import { generateHash } from '../../../src/api/auth';

export default function() {
  let authPath = 'morose/auth.json';
  let configPath = 'morose/config.json';

  let secret = Math.random().toString(36).substr(2, 10);
  let pass = generateHash('blabla', secret);
  let config = {
    port: 10000,
    ssl: false,
    secret: secret,
    upstream: 'https://registry.npmjs.org',
    useUpstream: true,
    saveUpstreamPackages: true
  };
  let auth = {
    organizations: [
      {
        name: 'bleenco',
        teams: [ { name: 'developers', members: [ 'admin' ] } ],
        members: [ { name: 'admin', role: 'owner' } ],
        packages: []
      }
    ],
    users: [
      { name: 'admin', password: pass, fullName: '', email: '', tokens: [] },
      { name: 'developer', password: pass, fullName: '', email: '', tokens: [] }
    ],
    packages: []
  };

  return Promise.resolve()
    .then(() => fs.createDir('morose'))
    .then(() => fs.writeJsonFile(configPath, config))
    .then(() => fs.writeJsonFile(authPath, auth));
}
