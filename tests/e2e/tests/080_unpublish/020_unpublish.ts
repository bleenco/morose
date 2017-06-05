import { npmPublish, npmLogin, npmUnPublish } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';
import * as fs from '../../utils/fs';

export default function() {
  let authPath = 'morose/auth.json';

  return Promise.resolve()
    .then(() => createPackageJson('package.json', 'test-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => npmUnPublish('test-package'))
    .then(() => fs.readJsonFile(authPath))
    .then(authObject => {
      if (authObject.packages.filter(p => p.name === 'test-package')) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
