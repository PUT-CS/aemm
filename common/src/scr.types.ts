export enum ScrType {
  FILE = "scr:file",
  FOLDER = "scr:folder",
}

export interface ScrNode {
  type: ScrType;
  name: string;
  description?: string;
  children?: ScrNode[];
}
