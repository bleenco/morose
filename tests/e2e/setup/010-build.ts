import { npm } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => console.log('Building morose...'))
    .then(() => npm('run', 'build:prod'))
    .then(() => console.log('Done.'));
}
