import * as optimist from 'optimist';
import { ExpressServer } from './lib/express';

const server = new ExpressServer();

server.init();
