import { request } from '../../utils/http';

export default function() {
  return Promise.resolve()
    .then(() => request('http://localhost:10000/user/login', 'GET'))
    .then(resp => resp.includes('<title>morose</title>') ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
