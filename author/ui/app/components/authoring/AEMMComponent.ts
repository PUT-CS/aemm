import React from "react";
import { z } from "zod";

export default class AEMMComponent<T> extends React.Component<T> {
  static defaultProps?: any;

  getSchema(): z.ZodTypeAny {
    throw new Error("getSchema method not implemented.");
  }

  isAuthoring(): boolean {
    const hasAuthoringParam = window.location.search.includes("mode=author");
    const hasForceAuthorProp = (this.props as any).forceAuthor === true;

    return hasAuthoringParam || hasForceAuthorProp;
  }
}
