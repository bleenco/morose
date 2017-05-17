import { npm } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => console.log('Linking morose...'))
    .then(() => npm('link'))
    .then(() => console.log('Done.'));
}
