import { request } from '../../utils/http';

export default function() {
  return Promise.resolve()
    .then(() => request('http://localhost:10000/js/app.js', 'GET'))
    .then(resp => resp.length ? Promise.resolve() : Promise.reject(resp))
    .then(() => request('http://localhost:10000/images/favicon.ico', 'GET'))
    .then(resp => resp.length ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
