interface Page {
  type: string;
  htmlTitle: string;
  description?: string;
  components: unknown[];
}

export type UserRole = "admin" | "editor";

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationPayload extends Timestamps {
  username: string;
  password: string;
  role: UserRole;
}

export interface User extends Timestamps {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
}
