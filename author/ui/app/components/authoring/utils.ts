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
