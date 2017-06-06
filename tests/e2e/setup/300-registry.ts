import { writeFile } from '../utils/fs';

export default function() {
  return Promise.resolve()
    .then(() => {
      let data = 'registry=http://localhost:10000';
      return writeFile('./.npmrc', data);
    });
}
