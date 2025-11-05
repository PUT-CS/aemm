enum ScrType {
  PAGE = "aemm:page",
  CONTAINER = "aemm:container",
  ANCHOR = "aemm:anchor",
}

export default interface ScrNode {
  type: ScrType;
  title?: string;
  description?: string;
}
