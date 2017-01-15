import * as yargs from 'yargs';
import * as os from 'os';
import { ExpressServer, ExpressServerOptions } from './lib/express';
import { getMoroseVersion } from './lib/utils';

let argv = yargs
  .usage('Usage: $0 [options]')
  .help('help').alias('help', 'h')
  .version('version', getMoroseVersion()).alias('version', 'v')
  .options({
    port: {
      alias: 'p',
      description: 'server port',
      requiresArg: true,
      required: false,
      default: 4720
    },
    dir: {
      alias: 'd',
      description: 'home directory of morose files',
      requiresArg: true,
      required: false,
      default: os.homedir()
    }
  })
  .argv;

let opts: ExpressServerOptions = new ExpressServerOptions({ port: argv.port, root: argv.dir });
let server: ExpressServer = new ExpressServer(opts);

server.init();
