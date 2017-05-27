import { npmPublish, npmLogin } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(res => {
      if (res.code === 0) {
        return Promise.resolve();
      }
      return Promise.reject();
    })
    .catch(() => Promise.reject());
}
