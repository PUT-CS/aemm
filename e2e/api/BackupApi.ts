import { BaseClient, type RequestOptions } from './BaseClient';

export class BackupApi extends BaseClient {
  list(path: string, options?: RequestOptions) {
    return this.send('GET', `/backup${path}`, options);
  }

  restore(path: string, backup: string, options?: RequestOptions) {
    return this.send('POST', `/backup${path}/${backup}`, options);
  }
}
