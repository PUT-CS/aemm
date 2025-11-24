export enum NodeType {
  FILE = "aemm:file",
  FOLDER = "aemm:folder",
  PAGE = "aemm:page",
  SITE = "aemm:site",
}

export interface ScrNode {
  type: NodeType;
  name: string;
  id: string;
  title?: string;
  description?: string;
  children?: ScrNode[];
}
