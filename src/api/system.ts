import * as os from 'os';
import { spawn } from 'child_process';
import { Observable } from 'rxjs';
import { getHumanSize } from './utils';

export interface INetworkIface {
  iface: string;
  address: string;
  in: number;
  inHuman: string;
  inSpeed: number;
  inSpeedHuman: string;
  out: number;
  outHuman: string;
  outSpeed: number;
  outSpeedHuman: string;
}

export function loadAverage(): Observable<{ load: number[], cores: number }> {
  return Observable.timer(1000)
    .timeInterval()
    .map(() => {
      return { load: os.loadavg(), cores: os.cpus().length };
    });
}

let inputUtilization: number[] = [];
let outputUtilization: number[] = [];

export function networkUtilization(): Observable<any> {

  return Observable.timer(1000)
    .timeInterval()
    .mergeMap(() => netstat(['-in']))
    .map(res => {
      let output = parseNetstatOutput(res);
      return output.map((iface, i) => {
        let inSpeed = iface.in - inputUtilization[i];
        iface.inSpeed = inSpeed || 0;
        iface.inSpeedHuman = getHumanSize(inSpeed || 0);

        let outSpeed = iface.out - outputUtilization[i];
        iface.outSpeed = outSpeed || 0;
        iface.outSpeedHuman = getHumanSize(outSpeed || 0);

        inputUtilization[i] = iface.in;
        outputUtilization[i] = iface.out;

        return iface;
      });
    });
}

function netstat(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let nstat = spawn('netstat', args);
    let output: string = '';
    let error: string = '';

    nstat.stdout.on('data', (data: string) => {
      output += data;
    });

    nstat.stderr.on('data', (data: string) => {
      error += data;
    });

    nstat.on('close', (code: number) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(error);
      }
    });
  });
}

function parseNetstatOutput(data: string): INetworkIface[] {
  return data
    .split('\n')
    .filter(line => !!line)
    .filter(line => {
      let splitted = line.split(/ +/);
      return splitted[3].includes('.');
    })
    .map(line => {
      let splitted = line.split(/ +/);
      return {
        iface: splitted[0],
        address: splitted[3],
        in: parseInt(splitted[4], 10) * <any>splitted[1],
        inHuman: getHumanSize(parseInt(splitted[4], 10) * <any>splitted[1]),
        inSpeed: null,
        inSpeedHuman: null,
        out: parseInt(splitted[6], 10) * <any>splitted[1],
        outHuman: getHumanSize(parseInt(splitted[6], 10) * <any>splitted[1]),
        outSpeed: null,
        outSpeedHuman: null
      };
    });
}
