import { Observable } from 'rxjs';
import * as zlib from 'zlib';
import * as tar from 'tar';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as request from 'request';
import * as chalk from 'chalk';
import { spawn } from 'child_process';
import { makeTmpDirectory, sha } from './utils';
import { getCache, addPackageToCache } from './cache';

export function savePackage(rootDir: string, pkgPath: string, 
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
            let destPkgPath = path.join(rootDir, 'packages', actualName, actualVersion,
              `${actualName}-${actualVersion}.tgz`);

            if (actualName !== name || actualVersion !== version) {
              observer.error(`Package rejected, expected ${name}@${version}, 
                got ${actualName}@${actualVersion}`);
              observer.complete();
            }

            if (fs.existsSync(destPkgPath)) {
              observer.error(`[${chalk.red('✖')}] Package already published ${chalk.yellow(`${name}@${version}`)}.`);
              observer.complete();
            }

            fs.copy(pkgPath, destPkgPath, err => {
              if (err) {
                observer.error(`[${chalk.red('✖')}] Error while copy.`);
                observer.complete();
              }

              fs.readFile(destPkgPath, (err, data) => {
                if (err) {
                  observer.error(`[${chalk.red('✖')}] Error while read ${destPkgPath}.`);
                  observer.complete();
                }

                let destPkgJson = path.join(rootDir, 'json', `${actualName}-${actualVersion}.json`);
                let pkgJson = {
                  name: jsonData.name,
                  version: jsonData.version,
                  path: destPkgPath,
                  sha: sha(data),
                  time: new Date().getTime()
                };

                fs.writeJson(destPkgJson, pkgJson, err => {
                  if (err) {
                    observer.error(`[${chalk.red('✖')}] Error while write JSON data for ${destPkgPath}.`);
                    observer.complete();
                  }

                  fs.unlink(pkgPath, err => {
                    if (err) {
                      observer.error(`[${chalk.red('✖')}] Error while unlink ${pkgPath}.`);
                      observer.complete();
                    }

                    addPackageToCache(pkgJson);
                    observer.complete();
                  });
                });
              });
            });
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
          observer.error(`[${chalk.red('✖')}] ${err}`);
          observer.complete();
        }

        if (resp.statusCode === 200) {
          observer.next(`[${chalk.green('✔')}] Package published ${chalk.yellow(`${name}@${version}`)}.`);
        } else {
          observer.error(body);
        }

        fs.unlink(packageFile, err => {
          if (err) {
            observer.error(`[${chalk.red('✖')}] ${err}`);
            observer.complete();
          }
          
          observer.complete();
        });
      });
      const form = req.form();
      form.append('file', fs.createReadStream(packageFile));
    });
  });
}

function registerPackageVersion(jsonData: any, pkgPath: string): Observable<any> {
  return new Observable(observer => {
    fs.stat(pkgPath, (err, stat) => {
      if (err) {
        observer.error(err);
        observer.complete();
      }

      const checksum = sha(fs.readFileSync(pkgPath));
      const name = jsonData.name;

      observer.complete();
    });
  });
}

function makePackageFromCurrentDir(): Observable<any> {
  return new Observable(observer => {
    process.chdir(process.cwd());
    const spawned = spawn('npm', ['pack']);

    spawned.stdout.on('data', data => {
      observer.next(data.toString().trim());
    });

    spawned.stderr.on('error', err => {
      observer.error(err);
      observer.complete();
    });

    spawned.on('close', (code) => {
      observer.complete();
    });
  });
}
