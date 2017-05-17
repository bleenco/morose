import { executeSilent, npmLogin } from '../../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => npmLogin('admin', 'blabla', 'foo@bar.com'))
    .then(() => executeSilent('npm logout'));
}
