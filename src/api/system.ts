import * as os from 'os';
import { Observable } from 'rxjs';

export function loadAverage(): Observable<{ load: number[], cores: number }> {
  return Observable.timer(1000)
    .timeInterval()
    .map(() => {
      return { load: os.loadavg(), cores: os.cpus().length };
    });
}
