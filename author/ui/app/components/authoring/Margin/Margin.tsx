import * as z from "zod";
import React from "react";
import AEMMComponent from "~/components/authoring/AEMMComponent";

const schema = z.object({
  horizontal: z
    .number()
    .min(0)
    .optional()
    .describe("Horizontal margin (left and right) in pixels. Default: 0"),
  vertical: z
    .number()
    .min(0)
    .optional()
    .describe("Vertical margin (top and bottom) in pixels. Default: 0"),
  className: z
    .string()
    .optional()
    .describe("Additional Tailwind class names for the container."),
  children: z.any().optional(),
});

export class Margin extends AEMMComponent<z.infer<typeof schema>> {
  getSchema() {
    return schema;
  }

  render() {
    const { horizontal = 0, vertical = 0, className, children } = this.props;

    const marginClasses = [
      horizontal > 0 ? `mx-[${horizontal}px]` : "",
      vertical > 0 ? `my-[${vertical}px]` : "",
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div data-aemm-component="Margin" className={marginClasses}>
        {children}
      </div>
    );
  }
}
