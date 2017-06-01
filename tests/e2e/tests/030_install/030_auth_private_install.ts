import { npmPublish, npmLogin, executeSilent, npmInstall } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/private-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => npmInstall('@bleenco/private-package'))
    .then(res => {
      if (res.code === 0) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
