import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface RequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class BaseClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected send(
    method: Method,
    url: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    return this.request.fetch(url, {
      method,
      headers: { 'X-AEMM-Request': '1', ...options.headers },
      data: options.data,
    });
  }
}
