import { BaseClient, type RequestOptions } from './BaseClient';

export class ContentApi extends BaseClient {
  tree(options?: RequestOptions) {
    return this.send('GET', '/scrtree', options);
  }

  get(path: string, options?: RequestOptions) {
    return this.send('GET', `/scr${path}`, options);
  }

  create(path: string, node: object, options?: RequestOptions) {
    return this.send('PUT', `/scr${path}`, { data: node, ...options });
  }

  edit(path: string, node: object, options?: RequestOptions) {
    return this.send('PATCH', `/scr${path}`, { data: node, ...options });
  }

  remove(path: string, options?: RequestOptions) {
    return this.send('DELETE', `/scr${path}`, options);
  }

  upload(path: string, body: Buffer, options?: RequestOptions) {
    return this.send('POST', `/scr${path}`, {
      data: body,
      headers: { 'Content-Type': 'application/octet-stream' },
      ...options,
    });
  }
}
