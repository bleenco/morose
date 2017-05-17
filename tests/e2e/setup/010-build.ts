import { npm } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => npm('run', 'build'))
    .then(() => npm('run', 'build:app'));
}
