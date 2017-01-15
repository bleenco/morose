import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as busboy from 'busboy';
import * as chalk from 'chalk';
import * as os from 'os';
import * as fs from 'fs';
import { savePackage, pkgVersions, getPkgData, getPkgInfo } from './package';
import { writeFile, rand, prepareRootDirectory, getMoroseVersion } from './utils';
import { initCache } from './cache';
import * as semver from 'semver';

export interface IExpressServerOptions {
  port: number;
  root: string;
}

export class ExpressServerOptions implements IExpressServerOptions {
  port: number;
  root: string;

  constructor(obj?: IExpressServerOptions) {
    this.port = obj && obj.port != null ? obj.port : 4720;
    this.root = obj && obj.root != null ? obj.root : `${os.homedir()}/morose`;
  }
}

export class ExpressServer {
  private app: express.Application;
  private router: express.Router;
  private options: IExpressServerOptions;

  constructor(opts?: IExpressServerOptions) {
    this.options = opts || new ExpressServerOptions();
  }

  init(): void {
    this.app = express();
    this.app.use(bodyParser.json());
    this.routes();

    prepareRootDirectory(this.options.root)
      .concat(initCache(this.options.root))
      .subscribe(data => {
        console.log(data);
      }, err => {
        throw new Error(err);
      }, () => {
        this.app.listen(this.options.port, () => {
          console.log(`[${chalk.green('✔')}] morose server running on port ${this.options.port}.`);
        });
      });
  }

  private routes(): void {
    this.app.get('/', (req, res) => res.status(200).json({ status: '✔', name: 'morose', version: getMoroseVersion() }));
    this.app.post('/package/:name/:version', this.publishVersion.bind(this));
    this.app.get('/package/:name/:range', this.getPackage.bind(this));
    this.app.get('/package/:name/:version/exact', this.getExactPackageVersion.bind(this));
    this.app.get('/info/:name', this.getPackageInfo.bind(this));
  }

  private publishVersion(req: express.Request, res: express.Response) {
    const { name, version } = req.params;
    const tmpPkgFile = path.join(this.options.root, 'tmp', `${rand()}${name}-${version}.tgz`);
    const busBoy = new busboy({ headers: req.headers });
    let overwrite: string;

    busBoy
    .on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.pipe(fs.createWriteStream(tmpPkgFile));
    })
    .on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
      if (fieldname === 'overwrite') {
        overwrite = val;
      }
    })
    .on('finish', () => {
      savePackage(this.options.root, tmpPkgFile, name, version, overwrite)
        .subscribe(data => {
          console.log(data);
        }, err => {
          return res.status(500).send(err);
        }, () => {
          return res.status(200).send();
        });
    });

    req.pipe(busBoy);
  }

  private getPackage(req: express.Request, res: express.Response) {
    let { name, range } = req.params;
    range = range || range === 'latest' ? 'x.x.x' : range;
    this.returnPackageByRange(name, range, res);
  }

  private returnPackageByRange(name: string, range: string, res: express.Response) {
    let version = semver.maxSatisfying(pkgVersions(name), range);

    if (!version) {
      return res.status(404).send();
    }

    let pkgData = getPkgData(name, version);
    res.type('application/x-compressed');
    res.header('Content-Disposition', `filename=${path.basename(pkgData.file)}`);
    res.status(200).download(pkgData.file);
  }


  private getExactPackageVersion(req: express.Request, res: express.Response) {
    let { name, version } = req.params;
    this.returnExactPackageVersion(name, version, res);
  }

  private returnExactPackageVersion(name: string, version: string, res: express.Response) {
    let versions = pkgVersions(name);
    if (versions.indexOf(version) === -1) {
      return res.status(404).send();
    } else {
      let pkgData = getPkgData(name, version);
      res.type('application/x-compressed');
      res.header('Content-Disposition', `filename=${path.basename(pkgData.file)}`);
      res.status(200).download(pkgData.file);
    }
  }

  private getPackageInfo(req: express.Request, res: express.Response) {
    let pkgInfo = getPkgInfo(req.params.name);
    if (!pkgInfo) {
      res.status(404).send();
    } else {
      res.status(200).json(pkgInfo);
    }
  }
}
