import * as os from 'os';
import { Observable } from 'rxjs';

export function loadAverage(): Observable<number[]> {
  return Observable.timer(1000)
    .timeInterval()
    .map(() => os.loadavg());
}
