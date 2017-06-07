import { npmPublish, npmLogin, npmLsDistTag, executeSilent } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', 'test-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => executeSilent('npm logout'))
    .then(() => npmLsDistTag('test-package'))
    .then(res => {
      if (res.code === 0 && res.stdout === 'latest: 0.0.1') {
        Promise.resolve();
      }
      Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
