import { npmPublish, npmLogin, lsPublicAccess } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/test-private-package'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => lsPublicAccess('@bleenco/test-private-package'))
    .then(res => {
      if (res.code === 0 && res.stdout.indexOf('Package access set to public!') !== -1) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
