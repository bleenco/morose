import { npmPublish, npmLogin } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/test-package', '0.0.1'))
    .then(() => npmLogin('developer', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(res => {
      if (res.code !== 0 && res.stderr.indexOf('code E403') !== -1) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
