import { Observable } from 'rxjs';
import * as zlib from 'zlib';
import * as tar from 'tar';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as request from 'request';
import * as chalk from 'chalk';
import { spawn } from 'child_process';
import { makeTmpDirectory } from './utils';

export function loadPackage(rootDir: string, pkgPath: string, 
  name: string, version: string): Observable<any> {
  return new Observable(observer => {
    makeTmpDirectory(rootDir).subscribe(dir => {
      fs.createReadStream(pkgPath)
        .pipe(zlib.createGunzip())
        .on('error', err => {
          observer.error(err);
          observer.complete();
        })
        .pipe(tar.Extract({ path: dir }))
        .on('end', () => {
          let jsonPath = path.join(dir, 'package/package.json');
          fs.readJSON(jsonPath, (err, jsonData) => {
            if (err) {
              observer.error(err);
              observer.complete();
            }

            fs.removeSync(dir);
            let actualName = jsonData.name;
            let actualVersion = jsonData.version;
            let expectedPkgPath = path.join(rootDir, 'packages', 
              `${actualName}-${actualVersion}.tgz`);

            if (actualName !== name || actualVersion !== version) {
              observer.error(`Package rejected, expected ${name}@${version}, 
                got ${actualName}@${actualVersion}`);
              observer.complete();
            }
          });
        });
    }, err => {
      observer.error(err);
      observer.complete();
    });
  });
}

export function publish(): Observable<any> {
  return new Observable(observer => {
    let packageFile;
    makePackageFromCurrentDir().subscribe(pkg => {
      packageFile = pkg;
    }, err => {
      observer.error(err);
      observer.complete();
    }, () => {
      const packageJson = fs.readJSONSync(path.join(process.cwd(), 'package.json'));
      const { name, version } = packageJson;
      const packageUrl = `http://localhost:4720/package/${name}/${version}`;
      let req = request.post(packageUrl, (err, resp, body) => {
        if (err) {
          observer.error(err);
          observer.complete();
        }

        if (resp.statusCode === 200) {
          observer.next(`${chalk.green('✔')} Package published.`);
        } else {
          observer.error(`Error: ${resp.statusCode}`);
        }

        fs.unlinkSync(packageFile);
        observer.complete();
      });
      const form = req.form();
      form.append('file', fs.createReadStream(packageFile));
    });
  });
}

function makePackageFromCurrentDir(): Observable<any> {
  return new Observable(observer => {
    process.chdir(process.cwd());
    const spawned = spawn('npm', ['pack'])
    spawned.stdout.on('data', data => {
      observer.next(data.toString().trim());
    })
    spawned.stderr.on('error', err => {
      observer.error(err);
      observer.complete();
    })
    spawned.on('close', (code) => {
      observer.complete();
    });
  });
}
