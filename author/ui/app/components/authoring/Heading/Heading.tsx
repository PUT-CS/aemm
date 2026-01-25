import * as z from "zod";
import React from "react";
import AEMMComponent from "~/components/authoring/AEMMComponent";
import { buildTextDescription } from "~/components/authoring/utils";

const schema = z.object({
  text: z
    .string()
    .min(1, "Heading text is required")
    .describe(buildTextDescription("plainText", "The heading text content.")),
  level: z
    .enum(["1", "2", "3", "4", "5", "6"])
    .default("2")
    .describe("Heading level (h1-h6). Default: h2"),
  className: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Additional Tailwind class names for the heading.",
      ),
    ),
});

const HEADING_STYLES: Record<string, string> = {
  "1": "text-4xl font-bold",
  "2": "text-3xl font-bold",
  "3": "text-2xl font-semibold",
  "4": "text-xl font-semibold",
  "5": "text-lg font-medium",
  "6": "text-base font-medium",
};

class Heading extends AEMMComponent<z.infer<typeof schema>> {
  static defaultProps = {
    text: "Heading",
    level: "2" as const,
  };

  getSchema() {
    return schema;
  }

  render() {
    const { text, level = "2", className } = this.props;

    const tagName = `h${level}`;
    const defaultStyles = HEADING_STYLES[level];

    const combinedClassName = [defaultStyles, className || ""]
      .filter(Boolean)
      .join(" ");

    return React.createElement(
      tagName,
      {
        "data-aemm-component": "Heading",
        className: combinedClassName,
      },
      text,
    );
  }
}

export default Heading;
