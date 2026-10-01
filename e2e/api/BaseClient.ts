import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface RequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class BaseClient {
  constructor(
    protected readonly request: APIRequestContext,
    readonly token?: string,
  ) {}

  protected send(
    method: Method,
    url: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const auth: Record<string, string> = this.token
      ? { Authorization: `Bearer ${this.token}` }
      : {};

    return this.request.fetch(url, {
      method,
      headers: options.headers ?? auth,
      data: options.data,
    });
  }
}
