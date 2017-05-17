import { execute } from '../../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => execute('npm logout'));
}
