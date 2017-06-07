import { npmPublish, npmLogin, npmLsDistTag, npmAddDistTag, npmRmDistTag }
  from '../../utils/process';
import { createPackageJson } from '../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => createPackageJson('package.json', '@bleenco/privatepackage', '0.0.1'))
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => npmPublish())
    .then(() => npmAddDistTag('@bleenco/privatepackage@0.0.1', 'tag1'))
    .then(() => npmRmDistTag('@bleenco/privatepackage', 'tag1'))
    .then(() => npmLsDistTag('@bleenco/privatepackage'))
    .then(res => {
      if (res.code === 0 && res.stdout.indexOf('tag1: 0.0.1') === -1) {
        return Promise.resolve();
      }

      return Promise.reject('');
    })
    .catch(() => Promise.reject(''));
}
