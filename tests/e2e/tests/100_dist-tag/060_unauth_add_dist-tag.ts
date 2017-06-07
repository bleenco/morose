import { npmPublish, npmLogin, execSilent, executeSilent }
  from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', 'test-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => executeSilent('npm logout'))
    .then(() => execSilent(
      'npm', ['-q', 'dist-tag', 'add', 'test-package@0.0.1', 'tag1', '--fetch-retries', '0']))
    .then(res => {
      if (res.code !== 0) {
        return Promise.resolve();
      }

      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
