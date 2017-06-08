import { npmPublish, npmLogin, execSilent } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';
import * as fs from '../../utils/fs';

export default function() {
  let authPath = 'morose/auth.json';

  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/test-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => execSilent(
      'npm', ['-q', 'unpublish', '@bleenco/test-package', '--force']))
    .then(() => fs.readJsonFile(authPath))
    .then(authObject => {
      if (!authObject.packages.find(p => p.name === '@bleenco/test-package')) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
