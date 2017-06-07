import { npmPublish, npmLogin, npmLsDistTag, npmAddDistTag }
  from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', 'test-package', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => npmAddDistTag('test-package@0.0.1', 'tag1'))
    .then(() => npmLsDistTag('test-package'))
    .then(res => {
      if (res.code === 0 && res.stdout.indexOf('tag1: 0.0.1') !== -1) {
        return Promise.resolve();
      }

      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
