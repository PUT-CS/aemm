import * as z from "zod";
import React from "react";
import AEMMComponent from "~/components/authoring/AEMMComponent";
import { buildTextDescription } from "~/components/authoring/utils";

const schema = z.object({
  src: z
    .string()
    .describe(
      buildTextDescription(
        "url",
        "Direct iframe src URL (e.g., embed URL for Vimeo, CodePen, Google Maps, etc.)",
      ),
    ),
  aspectRatio: z
    .enum(["16:9", "4:3", "1:1", "21:9", "none"])
    .optional()
    .describe(
      "Aspect ratio for responsive embeds. Use 'none' for fixed dimensions. Default: 16:9",
    ),
  width: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Width (only used if aspectRatio is 'none'). Default: 100%",
      ),
    ),
  height: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Height (only used if aspectRatio is 'none'). Default: 400px",
      ),
    ),
  allowFullscreen: z
    .boolean()
    .optional()
    .describe("Whether to allow fullscreen mode. Default: true"),
  title: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Title for accessibility. Default: Embedded content",
      ),
    ),
  className: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Additional Tailwind class names for the container.",
      ),
    ),
});

const ASPECT_RATIO_CLASSES: Record<string, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "21:9": "aspect-[21/9]",
};

export class Embed extends AEMMComponent<z.infer<typeof schema>> {
  getSchema() {
    return schema;
  }

  render() {
    const {
      src,
      aspectRatio = "16:9",
      width = "100%",
      height = "400px",
      allowFullscreen = true,
      title = "Embedded content",
      className,
    } = this.props;

    if (!src) {
      return (
        <div
          data-aemm-component="Embed"
          className={`border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 ${className || ""}`}
        >
          No embed source provided
        </div>
      );
    }

    const useAspectRatio = aspectRatio && aspectRatio !== "none";
    const aspectRatioClass = useAspectRatio
      ? ASPECT_RATIO_CLASSES[aspectRatio]
      : "";

    const containerClassName = [
      "embed-container",
      useAspectRatio ? "relative w-full" : "",
      aspectRatioClass,
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    const iframeClassName = useAspectRatio
      ? "absolute top-0 left-0 w-full h-full border-0"
      : "border-0";

    const iframeStyle: React.CSSProperties = useAspectRatio
      ? {}
      : { width, height };

    return (
      <div data-aemm-component="Embed" className={containerClassName}>
        <iframe
          src={src}
          title={title}
          width={useAspectRatio ? undefined : width}
          height={useAspectRatio ? undefined : height}
          style={iframeStyle}
          className={iframeClassName}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={allowFullscreen}
        />
      </div>
    );
  }
}
