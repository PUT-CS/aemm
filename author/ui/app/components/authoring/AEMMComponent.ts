import React from "react";
import { z } from "zod";

export default class AEMMComponent<T> extends React.Component<T> {
  getSchema(): z.ZodTypeAny {
    throw new Error("getSchema method not implemented.");
  }
}
