import { TEMPLATES_BY_KEY } from "@/lib/procedureRepo";

export type Stage = { key: string; label: string; order: number };
export type StageSet = Stage[];

const STAGE_KEYWORDS: Array<{ key: string; label: string; keywords: string[] }> = [
  { key: "recopilacion", label: "Recopilación", keywords: ["Recopilación", "Recopilacion"] },
  { key: "redaccion", label: "Redacción", keywords: ["Redacción", "Redaccion"] },
  { key: "presentacion", label: "Presentación", keywords: ["Presentación", "Presentacion"] },
  { key: "admisibilidad", label: "Admisibilidad", keywords: ["Admisibilidad"] },
  { key: "publicaciones", label: "Publicaciones", keywords: ["Publicaciones"] },
  { key: "visita_tecnica", label: "Visita Técnica", keywords: ["Visita Técnica"] },
  { key: "resolucion", label: "Resolución", keywords: ["Resolución"] },
  { key: "cbr", label: "CBR", keywords: ["CBR", "Anotación en CBR", "Anotacion en CBR"] },
];

const FALLBACK: StageSet = [
  { key: "inicio", label: "Inicio", order: 1 },
  { key: "publicaciones", label: "Publicaciones", order: 2 },
  { key: "visita_tecnica", label: "Visita Técnica", order: 3 },
  { key: "resolucion", label: "Resolución", order: 4 },
  { key: "cbr", label: "CBR", order: 5 },
];

export function inferStageSetFromTemplate(typeKey: string): StageSet {
  const spec = TEMPLATES_BY_KEY[typeKey];
  if (!spec) return FALLBACK;

  const stages: Stage[] = [];
  let order = 1;
  for (const s of STAGE_KEYWORDS) {
    const found = spec.steps.some((step) => {
      if (step.type === "step") return s.keywords.some((k) => step.title.includes(k));
      return step.steps.some((t) => s.keywords.some((k) => t.includes(k)));
    });
    if (found) stages.push({ key: s.key, label: s.label, order: order++ });
  }

  return stages.length ? stages : FALLBACK;
}

export function stageForProcedureFromSteps(
  typeKey: string,
  steps: { title: string; done: boolean }[]
): string {
  const stages = inferStageSetFromTemplate(typeKey);
  const doneTitles = new Set(steps.filter((s) => s.done).map((s) => s.title));
  let current = stages[0]?.key || "inicio";
  for (const stage of stages) {
    const meta = STAGE_KEYWORDS.find((s) => s.key === stage.key);
    if (!meta) continue;
    const covered = meta.keywords.every((k) => {
      for (const t of doneTitles) if (t.includes(k)) return true;
      return false;
    });
    if (covered) current = stage.key;
    else break;
  }
  return current;
}
