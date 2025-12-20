import * as z from "zod";
import React from "react";
import AEMMContainerComponent from "~/components/authoring/AEMMContainerComponent";

const schema = z.object({
  direction: z
    .enum(["horizontal", "vertical"])
    .default("vertical")
    .describe("Stacking direction: horizontal (row) or vertical (column)."),
  gap: z
    .number()
    .min(0)
    .optional()
    .describe("Gap between child elements in pixels (default: 16)."),
  align: z
    .enum(["start", "center", "end", "stretch"])
    .optional()
    .describe("Alignment of children along the cross axis."),
  justify: z
    .enum(["start", "center", "end", "between", "around", "evenly"])
    .optional()
    .describe("Justification of children along the main axis."),
  wrap: z
    .boolean()
    .optional()
    .describe("Whether children should wrap to the next line."),
  horizontal: z
    .number()
    .min(0)
    .optional()
    .describe("Horizontal margin (left and right) in pixels. Default: 16"),
  vertical: z
    .number()
    .min(0)
    .optional()
    .describe("Vertical margin (top and bottom) in pixels. Default: 16"),
  className: z
    .string()
    .optional()
    .describe("Additional Tailwind class names for the container."),
  children: z.any().optional(),
});

const ALIGN_CLASSES: Record<
  NonNullable<z.infer<typeof schema>["align"]>,
  string
> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const JUSTIFY_CLASSES: Record<
  NonNullable<z.infer<typeof schema>["justify"]>,
  string
> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

class Container extends AEMMContainerComponent<z.infer<typeof schema>> {
  static defaultProps = {
    direction: "vertical" as const,
    gap: 16,
    horizontal: 16,
    vertical: 16,
  };

  getSchema() {
    return schema;
  }

  render() {
    const {
      direction = "vertical",
      gap = 16,
      align,
      justify,
      wrap = false,
      horizontal = 16,
      vertical = 16,
      className,
      children,
    } = this.props;

    const directionClass = direction === "horizontal" ? "flex-row" : "flex-col";
    const alignClass = align ? ALIGN_CLASSES[align] : "";
    const justifyClass = justify ? JUSTIFY_CLASSES[justify] : "";
    const wrapClass = wrap ? "flex-wrap" : "";

    const combinedClassName = [
      "flex",
      directionClass,
      alignClass,
      justifyClass,
      wrapClass,
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    const style: React.CSSProperties = {
      gap: `${gap}px`,
      marginLeft: horizontal ? `${horizontal}px` : undefined,
      marginRight: horizontal ? `${horizontal}px` : undefined,
      marginTop: vertical ? `${vertical}px` : undefined,
      marginBottom: vertical ? `${vertical}px` : undefined,
    };

    return (
      <div
        data-aemm-component="Container"
        className={combinedClassName}
        style={style}
      >
        {children}
      </div>
    );
  }
}

export default Container;
