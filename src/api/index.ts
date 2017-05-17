#!/usr/bin/env node

import { resolve } from 'path';
import { homedir } from 'os';
import * as minimist from 'minimist';

const argv = minimist(process.argv.slice(2), {
  boolean: ['test'],
  string: ['dir']
});

import * as server from './server';

const dir = resolve(process.cwd(), argv.dir) || `${homedir()}/.morose`;
const test = argv.test || false;

server.start(dir, test);
