import * as request from 'request';
import { IPackage } from './package';
import * as logger from './logger';
import * as express from 'express';
import { writeJsonFile, ensureDirectory } from './fs';
import { dirname } from 'path';

export function getUpstreamPackage(config: any, pkgJsonPath: string, baseUrl: string,
                                   pkgName: string, res: express.Response) {
  if (config.useUpstream) {
    fetchUpstreamData(config.upstream, pkgName, baseUrl)
      .then((body: IPackage) => {
        if (body.versions) {
          body = changeUpstreamDistUrls(config.upstream, baseUrl, body);
          ensureDirectory(dirname(pkgJsonPath)).then(() => {
            writeJsonFile(pkgJsonPath, body).then(() => res.status(200).json(body));
          });
        } else {
          return res.status(404).json('');
        }
      });
  } else {
    return res.status(404).json('');
  }
}

export function fetchUpstreamData(upstreamUrl: string, pkgName: string,
  baseUrl: string): Promise<IPackage> {
  let fetchUrl = upstreamUrl + '/' + pkgName;
  return getResponse(fetchUrl).then(body => {
    return body;
  });
}

export function changeUpstreamDistUrls(upstreamUrl: string, baseUrl: string, body: any): IPackage {
  let versions = Object.keys(body.versions).reduce((acc, curr) => {
    acc[curr] = body.versions[curr];
    acc[curr].dist.tarball = acc[curr].dist.tarball.replace(upstreamUrl, baseUrl);
    delete acc[curr]._npmOperationalInternal;
    return acc;
  }, {});

  body.versions = versions;
  return body;
}

function getResponse(url: string): Promise<IPackage> {
  return new Promise((resolve, reject) => {
    request(url, { method: 'GET' }, (err, resp, body) => {
      if (err) {
        logger.httpOut(url, 'GET', '500');
        reject(err);
      }

      logger.httpOut(url, 'GET', '200');
      resolve(JSON.parse(body));
    });
  });
}
