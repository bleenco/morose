import * as yargs from 'yargs';
import { publish } from './lib/package';
import { getMoroseVersion } from './lib/utils';

let argv = yargs
  .usage('Usage: $0 [command] [options]')
  .command('publish', 'publish npm package')
  .command('info', 'get info of npm package')
  .help('help').alias('help', 'h')
  .version('version', getMoroseVersion()).alias('version', 'v')
  .options({
    url: {
      alias: 'u',
      description: 'morose server url publish to',
      requiresArg: true,
      required: true,
      default: 'http://localhost:4720'
    },
    overwrite: {
      alias: 'o',
      description: 'overwrite existing package version',
      requiresArg: false,
      required: false,
      default: false
    }
  })
  .argv;

let command = argv._[0];

if (!command || !argv.url) {
  yargs.showHelp();
}

if (command === 'publish' && !!argv.url) {
  publish(argv.url, argv.overwrite).subscribe(data => {
    console.log(data);
  }, err => {
    console.log(err);
  });
} else if (command === 'info') {

}
