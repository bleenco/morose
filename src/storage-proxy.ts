import { getConfig } from './utils';
import * as request from 'request';
import * as logger from './logger';

export function getUplinks(): string[] {
  let config = getConfig();
  return config.upstreams;
}

export function getResponse(url: string, method: string): Promise<string> {
  return new Promise(resolve => {
    request(url, { method: method },
      (err, response: request.RequestResponse, body) => {
      logger.httpOut(url, method, response);
      resolve(body);
    });
  });
}

export function findUplinkPackages(name: string, version?: string): Promise<string> {
  return new Promise(resolve => {
    let uplinks = getUplinks();
    Promise.all(uplinks.map(url => getRequestStatusCode(`${url}/${name}`, 'GET')))
      .then(resp => {
        let foundUrls = resp.map((r, i) => { return { index: i, code: r.code, url: r.url }; })
          .filter(r => r.code === 200)
          .map(r => r.url);

        resolve(foundUrls);
      });
  });
}

function getRequestStatusCode(url: string, method: string): Promise<{ code: number, url: string }> {
  return new Promise(resolve => {
    request(url, { method: method }, (err, resp, body) => {
      resolve({ url: url, code: resp.statusCode });
    });
  });
}

