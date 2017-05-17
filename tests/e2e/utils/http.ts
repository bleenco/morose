import { IncomingMessage } from 'http';
import * as _request from 'request';


export function request(url: string, method: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let options = {
      url: url,
      method: method
    };

    _request(options, (error: any, response: IncomingMessage, body: string) => {
      if (error) {
        reject(error);
      } else if (response.statusCode >= 400) {
        reject(new Error(`Requesting "${url}" returned status code ${response.statusCode}.`));
      } else {
        resolve(body);
      }
    });
  });
}
