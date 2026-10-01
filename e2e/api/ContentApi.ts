import { BaseClient, type RequestOptions } from './BaseClient';

export class ContentApi extends BaseClient {
  tree(options?: RequestOptions) {
    return this.send('GET', '/scrtree', options);
  }

  get(path: string, options?: RequestOptions) {
    return this.send('GET', `/scr${path}`, options);
  }
}
