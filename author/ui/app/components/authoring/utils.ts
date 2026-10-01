import type { TextKind } from "~/components/authoring/Text/Text";

export type DescriptionKind = TextKind | "url";

export function buildTextDescription(
  kind: DescriptionKind,
  about: string,
): string {
  const obj = {
    kind: kind,
    about: about,
  };
  return JSON.stringify(obj);
}

export const HTTP_PROTOCOLS = ["http:", "https:"];
export const LINK_PROTOCOLS = [...HTTP_PROTOCOLS, "mailto:", "tel:"];

export function isSafeUrl(
  url: string | undefined,
  protocols: string[] = HTTP_PROTOCOLS,
): url is string {
  if (!url) return false;
  try {
    return protocols.includes(new URL(url, "http://relative.invalid").protocol);
  } catch {
    return false;
  }
}

// Prefix each class name with "!" to make them overrides in Tailwind CSS
export function processUserClassNames(
  userClassNames: string | undefined,
): string {
  return (
    userClassNames
      ?.split(" ")
      .map((className) => `!${className}`)
      .join(" ") || ""
  );
}
