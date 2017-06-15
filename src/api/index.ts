import { resolve } from 'path';
import { homedir } from 'os';
import * as minimist from 'minimist';

const argv = minimist(process.argv.slice(2), {
  boolean: ['test'],
  string: ['dir']
});

import { start } from './server';

let dir = `${homedir()}/.morose`;
if (argv.dir && argv.dir.startsWith('/')) {
  dir = argv.dir;
} else if (argv.dir && !argv.dir.startsWith('/')) {
  dir = resolve(process.cwd(), argv.dir);
}

const test = argv.test || false;

start(dir, test);
