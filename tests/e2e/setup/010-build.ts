import { execute } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => execute('npm run build'))
    .then(() => execute('npm run build:app'));
}
