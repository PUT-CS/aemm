import { Timestamps } from "../aemm";

export enum NodeType {
  FILE = "aemm:file",
  FOLDER = "aemm:folder",
  PAGE = "aemm:page",
  SITE = "aemm:site",
  ANY = "aemm:any",
}

export interface ScrNode extends Timestamps {
  type: NodeType;
  name: string;
  title?: string;
}

export interface ScrNodeWithChildren extends ScrNode {
  children: ScrNodeWithChildren[];
}

export type ScrNodeWithoutTimestamps = Omit<ScrNode, keyof Timestamps>;
