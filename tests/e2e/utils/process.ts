import * as child_process from 'child_process';
import { blue, yellow } from 'chalk';
const treeKill = require('tree-kill');
const suppose = require('suppose');
import * as fs from './fs';

interface ExecOptions {
  silent?: boolean;
}

interface ProcessOutput {
  stdout: string;
  stderr: string;
  code: number;
}

let _processes: child_process.ChildProcess[] = [];

function _run(options: ExecOptions, cmd: string, args: string[]): Promise<ProcessOutput> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const cwd = process.cwd();
    console.log(
      `==========================================================================================`
    );

    args = args.filter(x => x !== undefined);
    const flags = [
      options.silent || false
    ]
      .filter(x => !!x)
      .join(', ')
      .replace(/^(.+)$/, ' [$1]');

    console.log(blue(`Running \`${cmd} ${args.map(x => `"${x}"`).join(' ')}\`${flags}...`));
    console.log(blue(`CWD: ${cwd}`));
    const spawnOptions: any = {cwd};

    if (process.platform.startsWith('win')) {
      args.unshift('/c', cmd);
      cmd = 'cmd.exe';
      spawnOptions['stdio'] = 'pipe';
    }

    const childProcess = child_process.spawn(cmd, args, spawnOptions);

    _processes.push(childProcess);

    childProcess.stdout.on('data', (data: Buffer) => {
      setTimeout(() => resolve(), 100);

      stdout += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.log('  ' + line));
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.error(yellow('  ' + line)));
    });

    childProcess.on('close', (code: number) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        const err = new Error(`Running "${cmd} ${args.join(' ')}" returned error code `);
        reject(err);
      }
    });
  });
}

function _exec(options: ExecOptions, cmd: string, args: string[]): Promise<ProcessOutput> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const cwd = process.cwd();
    console.log(
      `==========================================================================================`
    );

    args = args.filter(x => x !== undefined);
    const flags = [
      options.silent || false
    ]
      .filter(x => !!x)
      .join(', ')
      .replace(/^(.+)$/, ' [$1]');

    console.log(blue(`Running \`${cmd} ${args.map(x => `"${x}"`).join(' ')}\`${flags}...`));
    console.log(blue(`CWD: ${cwd}`));
    const spawnOptions: any = {cwd};

    if (process.platform.startsWith('win')) {
      args.unshift('/c', cmd);
      cmd = 'cmd.exe';
      spawnOptions['stdio'] = 'pipe';
    }

    const childProcess = child_process.spawn(cmd, args, spawnOptions);

    _processes.push(childProcess);

    childProcess.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.log('  ' + line));
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.error(yellow('  ' + line)));
    });

    childProcess.on('close', (code: number) => {
      resolve({ stdout, stderr, code });
    });
  });
}

export function killAllProcesses(signal = 'SIGTERM'): Promise<void> {
  return Promise.all(_processes.map(process => killProcess(process.pid)))
    .then(() => { _processes = []; });
}

export function killProcess(pid: number): Promise<null> {
  return new Promise((resolve, reject) => {
    treeKill(pid, 'SIGTERM', err => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

export function exitCode(cmd: string): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log(blue(`Running \`${cmd}\`...`));
    child_process.exec(cmd).on('exit', code => {
      resolve(code);
    });
  });
}

export function execute(options: ExecOptions, cmd: string): Promise<any> {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }

      if (!options.silent) {
        console.log(stdout);
      }
    }).on('close', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Error running ${cmd}`));
      }
    });
  });
}

export function exec(cmd, args) {
  return _exec({ silent: false }, cmd, args);
}

export function executeSilent(cmd: string): Promise<any> {
  return execute({ silent: true }, cmd);
}

export function morose() {
  return _run({ silent: true }, 'morose', ['--dir', 'morose']);
}

export function wait(msecs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msecs);
  });
}

export function npmLogin(uname: string, passwd: string, email: string): Promise<any> {
  return new Promise((resolve, reject) => {
    suppose('npm', ['-s', 'login'])
      .when(/Username/ig).respond(uname + '\n')
      .when(/Password/ig).respond(passwd + '\n')
      .when(/Email/ig).respond(email + '\n')
      .on('error', err => reject(err))
      .end(code => resolve(code));
  });
}

export function npmPublish(): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'publish'])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function npmInstall(pkgName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.deleteFile('package.json')
      .then(() => exec('npm', ['install', pkgName]))
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function lsOwner(pkgName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'owner', 'ls', pkgName])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function addOwner(pkgName: string, user: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'owner', 'add', user, pkgName])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function rmOwner(pkgName: string, user: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'owner', 'rm', user, pkgName])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function lsPackagesAccess(pattern: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'access', 'ls-packages', pattern])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function lsCollaboratorsAccess(pattern: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'access', 'ls-collaborators', pattern])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function lsGrantAccess(permission: string, team: string, pkg: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'access', 'grant', permission, team, pkg])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function lsRevokeAccess(team: string, pkg: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'access', 'revoke', team, pkg])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function lsRestrictAccess(pkg: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'access', 'restricted', pkg])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}

export function lsPublicAccess(pkg: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('npm', ['-q', 'access', 'public', pkg])
      .then(res => resolve(res))
      .catch(() => reject());
  });
}
