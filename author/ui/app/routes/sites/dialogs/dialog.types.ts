import type { ScrNode } from "@aemm/common";

export interface DialogProps {
  parentPath: string;
  onClose?: () => void;
  existingNode?: ScrNode;
  nodePath?: string;
}
