import { getConfig } from './utils';
import * as request from 'request';

export function getUplinks(): string[] {
  let config = getConfig();
  return config.upstreams;
}

export function syncPackageWithUplinks(name: string, pkginfo: any, options: any): Promise<null> {
  return new Promise(resolve => {
    if (!pkginfo) {
      let exists = false;

      pkginfo = {
        name: name,
        versions: {},
        'dist-tags': {},
        uplinks: {}
      };
    }

    let uplinks = getUplinks();
  });
}
