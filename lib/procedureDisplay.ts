import { TEMPLATES_BY_KEY } from "@/lib/procedureRepo";

export function extractTitleFromGeneralInfo(generalInfo?: string | null): string {
  if (!generalInfo) return "Gestión s/n";
  const lines = generalInfo.split("\n").map(l => l.trim()).filter(Boolean);
  const first = lines.find(l => !/^tags:/i.test(l));
  return first || "Gestión s/n";
}

export function templateLabelForType(type?: string | null): string {
  if (!type) return "Tipo no definido";
  const spec = TEMPLATES_BY_KEY[type];
  return spec?.label ?? type;
}

export function formatLastAction(d?: Date | string | null): string {
  const date = d ? new Date(d) : null;
  if (!date) return "s/f";
  try {
    return date.toLocaleDateString("es-CL", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "s/f";
  }
}
