import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as busboy from 'busboy';
import * as chalk from 'chalk';
import { savePackage } from './package';
import { writeFile, rand, prepareRootDirectory } from './utils';
import { initCache } from './cache';

export class ExpressServer {
  private app: express.Application;
  private router: express.Router;
  private port: number;
  private root: string;

  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.port = 4720;
    this.root = '/Users/jan/Desktop/';
  }

  init(): void {
    this.routes();
    prepareRootDirectory(this.root)
    .concat(initCache(this.root))
    .subscribe(data => {
      console.log(data);
    }, err => {
      throw new Error(err);
    }, () => {
      this.app.listen(this.port, () => {
        console.log(`[${chalk.yellow('➥')}] morose server running on port ${this.port}.`);
      });
    });
  }

  private routes(): void {
    this.app.get('/', (req, res) => res.status(200).json({ status: true, data: 'morose server running.' }));
    this.app.post('/package/:name/:version', this.publishVersion.bind(this));
  }

  private publishVersion(req: express.Request, res: express.Response) {
    const { name, version } = req.params;
    const tmpPkgFile = path.join(this.root, 'tmp', `${rand()}${name}-${version}.tgz`);
    const busBoy = new busboy({ headers: req.headers });
    let pkgFile;

    busBoy
    .on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', (data) => {
        writeFile(tmpPkgFile, data)
        .concat(savePackage(this.root, tmpPkgFile, name, version))
        .subscribe(data => {
          console.log(data);
        }, err => {
          return res.status(500).send(err);
        }, () => {
          return res.status(200).send();
        });
      });
    });

    req.pipe(busBoy);
  }
}
