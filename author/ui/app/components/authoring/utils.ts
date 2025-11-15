import type { TextKind } from "~/components/authoring/Text/Text";

export function buildTextDescription(kind: TextKind, about: string): string {
  const obj = {
    kind: kind,
    about: about,
  };
  return JSON.stringify(obj);
}
