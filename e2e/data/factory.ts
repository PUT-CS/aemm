import { randomUUID } from 'node:crypto';

const unique = () => randomUUID().slice(0, 8);

export interface NewUser {
  username: string;
  password: string;
  role: string;
}

export function newUser(overrides: Partial<NewUser> = {}): NewUser {
  return {
    username: `user-${unique()}`,
    password: 'secret',
    role: 'editor',
    ...overrides,
  };
}
