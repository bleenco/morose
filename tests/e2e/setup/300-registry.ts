import { execSilent } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => execSilent('npm', ['set', 'registry', 'http://localhost:10000']));
}
