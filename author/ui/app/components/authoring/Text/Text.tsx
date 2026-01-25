import * as z from "zod";
import sanitize from "sanitize-html";
import React from "react";
import AEMMComponent from "~/components/authoring/AEMMComponent";
import { buildTextDescription } from "~/components/authoring/utils";
import { marked } from "marked";

export type TextKind = "richText" | "plainText";

const ALLOWED_TAGS = sanitize.defaults.allowedTags.concat([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

const ALLOWED_ATTRIBUTES = {
  ...sanitize.defaults.allowedAttributes,
  "*": ["class", "id"],
};

const schema = z.object({
  text: z
    .string()
    .optional()
    .describe(
      buildTextDescription("richText", "The content of the text component."),
    ),
  mainClassName: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Tailwind class names for the main element.",
      ),
    ),
});

class Text extends AEMMComponent<z.infer<typeof schema>> {
  static defaultProps = {
    text: "Edit this text",
  };

  getSchema() {
    return schema;
  }

  render() {
    const { text, mainClassName } = this.props;

    let htmlContent = text ?? "";

    // Convert markdown to HTML
    if (htmlContent) {
      htmlContent = marked.parse(htmlContent, { async: false }) as string;
    }

    // Sanitize the HTML
    const sanitizedHtml = sanitize(htmlContent, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: ALLOWED_ATTRIBUTES,
    });

    return (
      <span
        data-aemm-component="Text"
        className={`rich-text-content ${mainClassName || ""}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }
}

export default Text;
