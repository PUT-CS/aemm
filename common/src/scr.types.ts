export enum ScrType {
  PAGE = "aemm:page",
  CONTAINER = "aemm:container",
  ANCHOR = "aemm:anchor",
  FOLDER = "aemm:folder",
}

export default interface ScrNode {
  type: ScrType;
  title?: string;
  description?: string;
  children?: ScrNode[];
}
