import { npmPublish, npmLogin, executeSilent, execSilent } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', 'test-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => executeSilent('npm logout'))
    .then(() => execSilent('npm', ['-q', 'access', 'ls-packages', 'admin']))
    .then(res => {
      if (res.code !== 0 && res.stderr.indexOf('code E401') !== -1) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
