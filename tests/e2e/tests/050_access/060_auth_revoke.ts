import { npmPublish, npmLogin, execSilent } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/test-private-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => execSilent(
      'npm',
      ['-q', 'access', 'grant', 'read-only', 'bleenco:developers', '@bleenco/test-private-package']
    ))
    .then(() => execSilent(
      'npm', ['-q', 'access', 'revoke', 'bleenco:developers', '@bleenco/test-private-package']))
    .then(res => {
      if (res.code === 0 && res.stdout.indexOf('Permission revoked') !== -1) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
