import { NodeType, ScrNode } from "../scr";

export type UserRole = "admin" | "editor";

export interface Timestamps {
  createdAt: Date | number;
  updatedAt: Date | number;
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

export interface Page extends ScrNode {
  type: NodeType.PAGE;
  pageTemplatePath?: string;
  htmlTitle?: string;
  description?: string;
  components: unknown[];
}

export interface Folder extends ScrNode {
  type: NodeType.FOLDER;
}

export interface Site extends ScrNode {
  type: NodeType.SITE;
  defaultPageTemplatePath?: string;
  description?: string;
}
