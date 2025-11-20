import { z } from "zod";
import AEMMComponent from "~/components/authoring/AEMMComponent";
import {
  buildTextDescription,
  processUserClassNames,
} from "~/components/authoring/utils";

const schema = z.object({
  text: z
    .string()
    .optional()
    .describe(buildTextDescription("plainText", "The label of the button.")),
  href: z
    .string()
    .optional()
    .describe(
      buildTextDescription("plainText", "The URL the button links to."),
    ),
  openInNewTab: z
    .boolean()
    .optional()
    .describe("Whether to open the link in a new tab."),
  mainClassName: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Tailwind class names for the button element.",
      ),
    ),
});

export class Link extends AEMMComponent<z.infer<typeof schema>> {
  getSchema() {
    return schema;
  }

  render() {
    const { text, href, openInNewTab, mainClassName } = this.props;

    const defaultClassName =
      "cursor-pointer text-blue-500 underline hover:text-blue-700 transition-colors ";
    const className = defaultClassName + processUserClassNames(mainClassName);

    return (
      <a
        href={href}
        target={openInNewTab ? "_blank" : "_self"}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        className={className}
      >
        {text || ""}
      </a>
    );
  }
}
