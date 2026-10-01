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

export interface NewPage {
  type: string;
  name: string;
  title: string;
  components: unknown[];
}

export function newPage(overrides: Partial<NewPage> = {}): NewPage {
  return {
    type: 'aemm:page',
    name: `page-${unique()}`,
    title: 'Test page',
    components: [],
    ...overrides,
  };
}
