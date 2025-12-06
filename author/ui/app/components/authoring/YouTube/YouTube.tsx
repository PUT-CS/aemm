import * as z from "zod";
import React from "react";
import AEMMComponent from "~/components/authoring/AEMMComponent";
import { buildTextDescription } from "~/components/authoring/utils";

const schema = z.object({
  videoId: z
    .string()
    .min(1, "Video ID is required")
    .describe(
      buildTextDescription("plainText", "YouTube video ID (e.g., fiKG2Yb9goc)"),
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
  title: z
    .string()
    .optional()
    .describe(
      buildTextDescription(
        "plainText",
        "Title for accessibility. Default: YouTube video",
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

class YouTube extends AEMMComponent<z.infer<typeof schema>> {
  getSchema() {
    return schema;
  }

  render() {
    const {
      videoId,
      aspectRatio = "16:9",
      width = "100%",
      height = "400px",
      title = "YouTube video",
      className,
    } = this.props;

    if (!videoId) {
      return (
        <div
          data-aemm-component="YouTube"
          className={`border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500 ${className || ""}`}
        >
          No YouTube video ID provided
        </div>
      );
    }

    const embedSrc = `https://www.youtube.com/embed/${videoId}`;
    const useAspectRatio = aspectRatio && aspectRatio !== "none";
    const aspectRatioClass = useAspectRatio
      ? ASPECT_RATIO_CLASSES[aspectRatio]
      : "";

    const containerClassName = [
      "youtube-container",
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
      <div data-aemm-component="YouTube" className={containerClassName}>
        <iframe
          src={embedSrc}
          title={title}
          width={useAspectRatio ? undefined : width}
          height={useAspectRatio ? undefined : height}
          style={iframeStyle}
          className={iframeClassName}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
}

export default YouTube;
