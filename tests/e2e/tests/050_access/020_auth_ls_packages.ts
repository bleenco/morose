import { npmPublish, npmLogin, lsPackagesAccess } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', 'test-package'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => lsPackagesAccess('admin'))
    .then(res => {
      if (res.code === 0 && res.stdout.indexOf('"test-package": "read-write"') !== -1) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
