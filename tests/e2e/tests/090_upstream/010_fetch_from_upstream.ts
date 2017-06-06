import { execSilent, npmInstall } from '../../utils/process';
import { readJsonFile } from '../../utils/fs';

export default function() {
  return Promise.resolve()
    .then(() => npmInstall('@angular/core@4.1.3'))
    .then(() => readJsonFile('node_modules/@angular/core/package.json'))
    .then(json => json.version === '4.1.3' ? Promise.resolve() : Promise.reject(''));
}
