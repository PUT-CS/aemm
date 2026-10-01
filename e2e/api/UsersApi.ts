import { BaseClient, type RequestOptions } from './BaseClient';

export class UsersApi extends BaseClient {
  list(options?: RequestOptions) {
    return this.send('GET', '/users', options);
  }

  get(username: string, options?: RequestOptions) {
    return this.send('GET', `/users/${encodeURIComponent(username)}`, options);
  }

  create(user: object, options?: RequestOptions) {
    return this.send('POST', '/users', { data: user, ...options });
  }

  update(username: string, changes: object, options?: RequestOptions) {
    return this.send('PATCH', `/users/${encodeURIComponent(username)}`, {
      data: changes,
      ...options,
    });
  }

  remove(username: string, options?: RequestOptions) {
    return this.send(
      'DELETE',
      `/users/${encodeURIComponent(username)}`,
      options,
    );
  }
}
