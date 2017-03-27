import * as request from 'request';
import { createWriteStream } from 'fs';
import { dirname } from 'path';
import { writeJsonFile, ensureDirectory } from './fs';
import { getFilePath, getConfig } from './utils';
import { INpmPackage } from './package';
import { findPackage, storage, updatePkgStorage } from './storage';
import * as logger from './logger';

export function fetchUplinkPackage(packageName: string, version: string): Promise<any> {
  return new Promise(resolve => {
    let config = getConfig();
    let upstream = config.upstreams[0];

    packageName = version ? `${packageName}/${version}` : packageName;
    let url = `${upstream}/${packageName}`;

    getResponse(url).then(body => {
      body = JSON.parse(body);
      version = version || body['dist-tags']['latest'];
      url = body.versions[version].dist.tarball;
      let tarball = url.split('/').slice(-1)[0];
      packageName = packageName.replace(/\%2f/ig, '/');

      if (config.saveUpstreamPackages) {
        downloadTarball(url, tarball, packageName).then(() => {
          let pkg = findPackage(packageName);
          if (!pkg) {
            writePackageJson(packageName, version, body).then(() => resolve(body));
          } else {
            resolve(body);
          }
        });
      } else {
        resolve(body);
      }
    });
  });
}

function getResponse(url: string): Promise<any> {
  return new Promise(resolve => {
    logger.httpOut(url, 'GET');
    request(url, { method: 'GET' }, (err, resp, body) => resolve(body));
  });
}

function downloadTarball(url: string, tarball: string, packageName: string): Promise<null> {
  return new Promise(resolve => {
    let filePath = getFilePath(`tarballs/${packageName}/${tarball}`);
    ensureDirectory(dirname(filePath)).then(() => {
      request.get(url)
        .on('response', (resp: any) => {
          logger.httpIn(url, 'GET', resp);
          logger.info(`${filePath} saved locally.`);
          resolve();
        })
        .pipe(createWriteStream(filePath));
    });
  });
}

function writePackageJson(packageName: string, version: string, body: any): Promise<null> {
  let packageData: INpmPackage = {
    _id: packageName,
    name: packageName,
    description: body.description,
    'dist-tags': { 'latest': version },
    versions: body.versions
  };
  let filePath = getFilePath(`packages/${packageName}/${version}/package.json`);

  return ensureDirectory(dirname(filePath))
    .then(() => writeJsonFile(getFilePath(`packages/${packageName}/${version}/package.json`), packageData))
    .then(() => updatePkgStorage(packageName, packageData));
}
