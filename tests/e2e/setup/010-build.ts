import { executeSilent } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => executeSilent('npm run build:prod'));
}
