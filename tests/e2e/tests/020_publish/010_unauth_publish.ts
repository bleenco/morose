import { npmPublish } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', 'test-package', '0.0.1'))
    .then(() => npmPublish())
    .then(res => {
      if (res.code !== 0 && res.stderr.indexOf('code ENEEDAUTH') !== -1) {
        return Promise.resolve();
      }
      return Promise.reject();
    })
    .catch(() => Promise.reject());
}
