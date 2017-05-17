import { request } from '../../utils/http';

export default function() {
  return Promise.resolve()
    .then(() => request('http://localhost:10000', 'GET'));
}
