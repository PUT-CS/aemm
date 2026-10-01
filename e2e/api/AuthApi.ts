import { BaseClient, type RequestOptions } from './BaseClient';

export class AuthApi extends BaseClient {
  login(credentials: object, options?: RequestOptions) {
    return this.send('POST', '/login', { data: credentials, ...options });
  }
}
