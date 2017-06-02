import { npmPublish, npmLogin, deprecate, npmInstall } from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/privatepackage', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => deprecate('@bleenco/privatepackage', 'deprecate message'))
    .then(() => npmInstall('@bleenco/privatepackage'))
    .then(res => {
      if (res.code === 0 && res.stderr.indexOf('deprecate message') !== -1) {
        return Promise.resolve();
      }
      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
