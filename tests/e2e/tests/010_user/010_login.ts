import { npmLogin } from '../../utils/process';
import * as fs from '../../utils/fs';
import { generateHash } from '../../../../src/api/auth';
import { EOL } from 'os';

export default function() {
  let authPath = 'morose/auth.json';
  let configPath = 'morose/config.json';

  return Promise.resolve()
    .then(() => fs.readFile(configPath))
    .then(contents => {
      const config = JSON.parse(contents);
      const find = /\"password\"(.*)",/;
      const password = generateHash('blabla', config.secret);
      const replace = `"password": "${password}",`;
      return fs.replaceInFile(authPath, find, replace);
    })
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(code => code === 0 ? Promise.resolve() : Promise.reject(code));
}
