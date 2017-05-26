import { executeSilent, npmLogin } from '../../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(code => code === 0 ? Promise.resolve() : Promise.reject(code))
    .then(() => executeSilent('npm logout'))
    .then(code => code === 0 ? Promise.resolve() : Promise.reject(code));
}
