import { spawn } from 'child_process';
import { blue, yellow } from 'chalk';

interface ExecOptions {
  silent?: boolean;
}

interface ProcessOutput {
  stdout: string;
  stderr: string;
  code: number;
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

  const childProcess = spawn(cmd, args, spawnOptions);

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

export function exec(cmd: string, ...args: string[]) {
  return _exec({}, cmd, args);
}

export function silentExec(cmd: string, ...args: string[]) {
  return _exec({ silent: true}, cmd, args);
}

export function npm(...args: string[]) {
  return silentExec('npm', ...args);
}
