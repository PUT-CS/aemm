import * as z from "zod";
import React from "react";
import AEMMComponent from "~/components/authoring/AEMMComponent";
import { buildTextDescription } from "~/components/authoring/utils";

export type ImageKind = "url" | "plainText";

const schema = z.object({
  src: z
    .string()
    .url("Must be a valid URL")
    .describe(buildTextDescription("url", "The source URL of the image.")),
  alt: z
    .string()
    .min(1, "Alt text cannot be empty")
    .describe(
      buildTextDescription("plainText", "Alternative text for the image."),
    ),
  width: z
    .number()
    .positive("Width must be positive")
    .optional()
    .describe(
      buildTextDescription("plainText", "Width of the image in pixels."),
    ),
  height: z
    .number()
    .positive("Height must be positive")
    .optional()
    .describe(
      buildTextDescription("plainText", "Height of the image in pixels."),
    ),
  objectFit: z
    .enum(["contain", "cover", "fill", "none", "scale-down"])
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "How the image should fit within its container.",
      ),
    ),
  className: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Tailwind class names for the image element.",
      ),
    ),
  loading: z
    .enum(["lazy", "eager"])
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Loading strategy for the image. Lazy loading defers loading until near viewport.",
      ),
    ),
  rounded: z
    .boolean()
    .optional()
    .describe(
      buildTextDescription("plainText", "Whether to apply rounded corners."),
    ),
});

const OBJECT_FIT_CLASSES: Record<
  NonNullable<z.infer<typeof schema>["objectFit"]>,
  string
> = {
  contain: "object-contain",
  cover: "object-cover",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
};

class Image extends AEMMComponent<z.infer<typeof schema>> {
  getSchema() {
    return schema;
  }

  getDefaultProps() {
    return {
      src: "https://via.placeholder.com/400x300?text=Image+Placeholder",
      alt: "Placeholder image",
      loading: "lazy" as const,
    };
  }

  render() {
    const {
      src,
      alt,
      width,
      height,
      objectFit,
      className,
      loading = "lazy",
      rounded = false,
    } = this.props;

    if (!src) {
      return (
        <div>
          {this.isAuthoring() ? (
            <span style={{ color: "red" }}>
              Image component requires a valid "src" property.
            </span>
          ) : null}
        </div>
      );
    }

    const fullSrc =
      src.startsWith("/") && process.env["BACKEND_URL"]
        ? `${process.env["BACKEND_URL"]}${src}`
        : src;

    const objectFitClass = objectFit ? OBJECT_FIT_CLASSES[objectFit] : "";
    const roundedClass = rounded ? "rounded-lg" : "";
    const combinedClassName = [objectFitClass, roundedClass, className || ""]
      .filter(Boolean)
      .join(" ");

    return (
      <img
        src={fullSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        data-aemm-component="Image"
        className={combinedClassName || undefined}
      />
    );
  }
}

export default Image;
