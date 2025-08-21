import { prisma } from "@/lib/prisma";
import { parseFilters } from "@/lib/filters";
import { Prisma } from "@prisma/client";
import { TYPE_LABELS } from "@/lib/procedureRepo";
import { inferStageSetFromTemplate, stageForProcedureFromSteps } from "@/lib/stages";

export type KanbanCard = {
  id: number;
  clientName: string;
  title: string;
  templateLabel?: string;
  region?: string | null;
  lastActionAt?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  typeKey?: string;
  priority?: "ALTA" | "MEDIA" | "BAJA" | null;
  tags?: string[];
};

export type KanbanData = {
  mode: "estado" | "etapas";
  typeFilter?: string | null;
  columns: { key: string; label: string; count: number }[];
  lanes: Record<string, KanbanCard[]>;
  typeTabs?: { key: string; label: string }[];
  paging: Record<string, { hasMore: boolean }>;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  DONE: "Finalizado",
};

function extractTags(info: string | null | undefined): string[] {
  if (!info) return [];
  const m = info.match(/\n\n\[TAGS\]: (.*)$/);
  if (!m) return [];
  return m[1].trim().split(/\s+/).filter(Boolean);
}

export async function getKanbanData(
  searchParams: Record<string, string | string[] | undefined>
): Promise<KanbanData> {
  const filters = parseFilters(searchParams);
  const mode = searchParams.mode === "etapas" ? "etapas" : "estado";

  const where: Prisma.ProcedureWhereInput = {};
  if (filters.client) where.clientId = filters.client;
  if (filters.region) where.region = filters.region;
  if (filters.province) where.province = filters.province;
  if (filters.type) where.type = filters.type;
  if (filters.status && mode === "estado") where.status = filters.status;
  const tagFilters: Prisma.ProcedureWhereInput[] = [];
  if (filters.tagDelegable) tagFilters.push({ generalInfo: { contains: "#Delegable" } });
  if (filters.tagPrioridad) tagFilters.push({ generalInfo: { contains: "#Prioridad" } });
  if (tagFilters.length) where.AND = [...(where.AND ?? []), ...tagFilters];

  const orderParam = (filters.order ?? "lastActionAt_desc") as
    | "createdAt_asc"
    | "createdAt_desc"
    | "lastActionAt_asc"
    | "lastActionAt_desc";
  const [field, dir] = orderParam.split("_") as [
    "createdAt" | "lastActionAt",
    "asc" | "desc"
  ];
  const sortDir: Prisma.SortOrder = dir;
  const orderBy: Prisma.ProcedureOrderByWithRelationInput[] =
    field === "createdAt" ? [{ createdAt: sortDir }] : [{ lastActionAt: sortDir }];

  const take = 25;
  const lanes: Record<string, KanbanCard[]> = {};
  const columns: { key: string; label: string; count: number }[] = [];
  const paging: Record<string, { hasMore: boolean }> = {};

  if (mode === "estado") {
    const statuses = filters.status
      ? [filters.status]
      : ["PENDING", "IN_PROGRESS", "DONE"];
    for (const key of statuses) {
      const skip = Number(searchParams[`skip_${key}`] || 0);
      const [items, count] = await Promise.all([
        prisma.procedure.findMany({
          where: { ...where, status: key },
          include: { client: true },
          orderBy,
          skip,
          take,
        }),
        prisma.procedure.count({ where: { ...where, status: key } }),
      ]);
      lanes[key] = items.map((p) => ({
        id: p.id,
        clientName: p.client.name,
        title: p.title || "",
        templateLabel: TYPE_LABELS[p.type],
        region: p.region,
        lastActionAt: p.lastActionAt?.toISOString() || null,
        status: p.status as any,
        typeKey: p.type,
        tags: extractTags(p.generalInfo),
        priority: null,
      }));
      columns.push({ key, label: STATUS_LABELS[key], count });
      paging[key] = { hasMore: count > skip + take };
    }
    return { mode, typeFilter: filters.type ?? null, columns, lanes, paging };
  }

  // etapas mode
  let typeFilter = filters.type || null;
  if (!typeFilter) {
    const types = await prisma.procedure.findMany({
      where,
      distinct: ["type"],
      select: { type: true },
    });
    if (types.length > 1) {
      return {
        mode: "etapas",
        columns: [],
        lanes: {},
        paging: {},
        typeTabs: types.map((t) => ({
          key: t.type,
          label: TYPE_LABELS[t.type] || t.type,
        })),
      };
    }
    typeFilter = types[0]?.type || null;
  }

  if (!typeFilter) {
    return { mode: "etapas", columns: [], lanes: {}, paging: {} };
  }

  const stageSet = inferStageSetFromTemplate(typeFilter);
  stageSet.forEach((s) => (lanes[s.key] = []));

  const procs = await prisma.procedure.findMany({
    where: { ...where, type: typeFilter },
    include: { client: true, steps: { orderBy: { order: "asc" } } },
    orderBy,
  });

  procs.forEach((p) => {
    const stageKey = stageForProcedureFromSteps(typeFilter!, p.steps);
    const card: KanbanCard = {
      id: p.id,
      clientName: p.client.name,
      title: p.title || "",
      templateLabel: TYPE_LABELS[p.type],
      region: p.region,
      lastActionAt: p.lastActionAt?.toISOString() || null,
      status: p.status as any,
      typeKey: p.type,
      tags: extractTags(p.generalInfo),
      priority: null,
    };
    (lanes[stageKey] ||= []).push(card);
  });

  for (const s of stageSet) {
    const count = lanes[s.key]?.length || 0;
    columns.push({ key: s.key, label: s.label, count });
    paging[s.key] = { hasMore: false };
  }

  return { mode: "etapas", typeFilter, columns, lanes, paging };
}
