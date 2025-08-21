import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { fmtCLP } from "@/lib/utils";
import { toNumberSafe } from "@/lib/decimal";
import { parseFilters, type Filters } from "@/lib/filters";
import { createClientAndProcedure } from "@/app/actions";
import Toast from "@/components/Toast";
import SubmitButton from "@/components/SubmitButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { CATEGORY_PREFIX } from "@/lib/procedureRepo";
import FiltersPanel from "./FiltersPanel";
import NewProcedureForm from "./NewProcedureForm";
import ProceduresList from "./ProceduresList";
import ProcedureDetail from "./ProcedureDetail";

export const dynamic = "force-dynamic";

async function getData(params: Filters) {
  const where: Prisma.ProcedureWhereInput = {};
  if (params.client) where.clientId = params.client;
  if (params.status) where.status = params.status;
  if (params.region) where.region = params.region;
  if (params.province) where.province = params.province;

  const category = params.category as "ADMIN" | "JUDICIAL" | "OTROS" | "CORRETAJE" | undefined;
  if (category) {
    where.type = { startsWith: CATEGORY_PREFIX[category] };
  }
  if (params.type) {
    where.type = params.type;
  }

  const tagFilters: Prisma.ProcedureWhereInput[] = [];
  if (params.tagDelegable) tagFilters.push({ generalInfo: { contains: "#Delegable" } });
  if (params.tagPrioridad) tagFilters.push({ generalInfo: { contains: "#Prioridad" } });
  if (tagFilters.length) {
    where.AND = [...(where.AND ?? []), ...tagFilters];
  }

  const orderParam = (params.order ?? "lastActionAt_desc") as
    | "createdAt_asc"
    | "createdAt_desc"
    | "lastActionAt_asc"
    | "lastActionAt_desc";
  const [field, dir] = orderParam.split("_") as ["createdAt" | "lastActionAt", "asc" | "desc"];
  const sortDir: Prisma.SortOrder = dir;
  const orderBy: Prisma.ProcedureOrderByWithRelationInput[] =
    field === "createdAt" ? [{ createdAt: sortDir }] : [{ lastActionAt: sortDir }];

  const list = await prisma.procedure.findMany({ where, include: { client: true }, orderBy });
  let current: Prisma.ProcedureGetPayload<{ include: {
    client: true;
    steps: { orderBy: { order: "asc" } };
    expenses: true;
    todos: true;
    waterRights: true;
    proposal: { include: { milestones: true } };
  } }> | null = null;
  let ufRatesMap: Record<string, number> = {};

  if (params.id) {
    current = await prisma.procedure.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        steps: { orderBy: { order: "asc" } },
        expenses: true,
        todos: true,
        waterRights: true,
        proposal: { include: { milestones: true } },
      },
    });
    if (current) {
      const dateKeys = new Set<string>();
      current.expenses.forEach((e) => {
        if (e.paidAt) dateKeys.add(new Date(e.paidAt).toISOString().slice(0, 10));
      });
      current.proposal?.milestones?.forEach((m) => {
        if (m.triggeredAt) dateKeys.add(new Date(m.triggeredAt).toISOString().slice(0, 10));
      });
      if (dateKeys.size > 0) {
        const dates = Array.from(dateKeys).map((d) => new Date(d));
        const rates = await prisma.uFRate.findMany({ where: { date: { in: dates } } });
        ufRatesMap = Object.fromEntries(
          rates
            .map((r) => [new Date(r.date).toISOString().slice(0, 10), toNumberSafe(r.value)])
            .filter(([, v]) => v !== null)
        );
      }
    }
  }

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  return { list, current, clients, ufRatesMap };
}

export default async function GestionesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const filters = parseFilters(searchParams);
  const { list, current, clients, ufRatesMap } = await getData(filters);

  return (
    <main className="space-y-6">
      <Toast />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-medium tracking-wide">Gestiones</h1>
        <span className="text-sm text-ink-muted">{list.length} gestiones</span>
      </div>

      {/* Layout 3 Bloques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Columna Izquierda - Stack */}
        <div className="space-y-6">
          {/* Bloque 1 - Filtros */}
          <FiltersPanel searchParams={filters} clients={clients} />
          
          {/* Bloque 2 - Nueva Gestión */}
          <NewProcedureForm clients={clients} />
        </div>

        {/* Columna Derecha - Bloque 3 - Lista de Gestiones o Detalle */}
        <div className="lg:col-span-1">
          {searchParams.pid ? (
            <Card className="glass rounded-2xl p-5 h-[calc(100vh-160px)] overflow-auto">
              <ProcedureDetail procedureId={Number(searchParams.pid)} />
            </Card>
          ) : (
            <ProceduresList 
              procedures={list} 
              current={current} 
              searchParams={filters}
              ufRatesMap={ufRatesMap}
            />
          )}
        </div>
      </div>
    </main>
  );
}
