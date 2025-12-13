import React from "react";
import { z } from "zod";

export default class AEMMComponent<T> extends React.Component<T> {
  getSchema(): z.ZodTypeAny {
    throw new Error("getSchema method not implemented.");
  }

  getDefaultProps(): Partial<T> {
    return {} as Partial<T>;
  }

  isAuthoring(): boolean {
    const hasAuthoringParam = window.location.search.includes("mode=author");
    const hasForceAuthorProp = (this.props as any).forceAuthor === true;

    return hasAuthoringParam || hasForceAuthorProp;
  }
}
