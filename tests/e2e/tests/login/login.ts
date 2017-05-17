import { silentExec, execute } from '../../utils/process';
import * as fs from '../../utils/fs';
import { generateHash } from '../../../../src/api/auth';

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
    .then(() => execute(`echo -e "admin\nblabla\nbla@bla.com" | npm login`));
}
