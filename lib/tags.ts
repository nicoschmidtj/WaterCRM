export function extractTags(text?: string | null): string[] {
  if (!text) return [];
  const line = text.split("\n").find(l => l.trim().toLowerCase().startsWith("tags:"));
  if (!line) return [];
  return line.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
}

export function setTagsInGeneralInfo(text: string | null | undefined, tags: string[]): string {
  const base = (text ?? "").split("\n").filter(Boolean);
  const withoutTags = base.filter(l => !/^tags:/i.test(l.trim()));
  const line = tags.length ? `Tags: ${tags.join(" ")}` : "";
  return [...withoutTags, line].filter(Boolean).join("\n");
}
