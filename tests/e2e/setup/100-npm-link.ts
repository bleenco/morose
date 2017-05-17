import { npm } from '../utils/process';

export default function() {
  return Promise.resolve()
    .then(() => npm('link'));
}
