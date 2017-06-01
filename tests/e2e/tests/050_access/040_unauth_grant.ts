import { npmPublish, npmLogin, executeSilent, lsGrantAccess } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/test-private-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => executeSilent('npm logout'))
    .then(() => npmLogin('developer', 'blabla', 'foo@bar.com'))
    .then(() => lsGrantAccess('read-only', 'bleenco:developers', '@bleenco/test-private-package'))
    .then(res => {
      if (res.code !== 0) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
