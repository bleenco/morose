import * as request from 'request';
import { INpmPackage } from './package';
import * as logger from './logger';

export function fetchUpstreamData(upstreamUrl: string, pkgName: string,
  baseUrl: string): Promise<INpmPackage> {
  let fetchUrl = upstreamUrl + '/' + pkgName;
  return getResponse(fetchUrl).then(body => {
    return JSON.parse(body);
  });
}

export function changeUpstreamDistUrls(upstreamUrl: string, baseUrl: string, body: any): any {
  let versions = Object.keys(body.versions).reduce((acc, curr) => {
    acc[curr] = body.versions[curr];
    acc[curr].dist.tarball = acc[curr].dist.tarball.replace(upstreamUrl, baseUrl);
    delete acc[curr]._npmOperationalInternal;
    return acc;
  }, {});

  body.versions = versions;
  return body;
}

function getResponse(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    request(url, { method: 'GET' }, (err, resp, body) => {
      if (err) {
        logger.httpOut(url, 'GET', '500');
        reject(err);
      }

      logger.httpOut(url, 'GET', '200');
      resolve(body);
    });
  });
}
