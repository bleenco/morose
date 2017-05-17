import { executeSilent } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => executeSilent('npm set registry http://localhost:10000'));
}
