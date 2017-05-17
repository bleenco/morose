import * as child_process from 'child_process';
import { blue, yellow } from 'chalk';
const treeKill = require('tree-kill');

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
      setTimeout(() => resolve(), 1000);

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

  return new Promise((resolve, reject) => {
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

export function execute(cmd: string): Promise<null> {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject();
      }
    }).on('exit', code => resolve(code));
  });
}

export function exec(cmd: string, ...args: string[]) {
  return _exec({}, cmd, args);
}

export function silentExec(cmd: string, ...args: string[]) {
  return _exec({ silent: true}, cmd, args);
}

export function npm(...args: string[]) {
  return silentExec('npm', ...args);
}

export function morose() {
  return _run({ silent: true }, 'morose', ['--dir', 'morose']);
}

export function wait(msecs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msecs);
  });
}
