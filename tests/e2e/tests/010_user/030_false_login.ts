import { npmLogin } from '../../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        npmLogin('admin', 'blablabla', 'foo@bar.com')
          .then(() => reject())
          .catch(err => resolve());
      });
    });
}
