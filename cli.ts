import * as optimist from 'optimist';
import { publish } from './lib/package';

const argv = optimist
  .usage('morose publish [url]              Publish package\n' +
         'morose info    <package_name>     Display information about remote package')
  .default({ u: 'http://localhost:4720' })
  .alias('u', 'url')
  .demand(['u'])
  .argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

const command = argv._[0];
const params = argv._.filter((p, i) => i !== 0);

if (command === 'publish') {
  let url = params[0] || 'http://localhost:4720';
  publish(url).subscribe(data => {
    console.log(data);
  }, err => {
    console.log(err);
  });
} else if (command === 'info') {
  
} else {
  optimist.showHelp();
}
