import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { fmtCLP } from "@/lib/utils";
import RegionProvinciaSelect from "@/components/RegionProvinciaSelect";
import { PROCEDURE_TYPES } from "@/lib/constants";
import { createClientAndProcedure } from "@/app/actions";
import Toast from "@/components/Toast";
import SubmitButton from "@/components/SubmitButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { STATUS } from "@/lib/constants";
import { CATEGORY_PREFIX } from "@/lib/procedureRepo";
import FiltersPanel from "./FiltersPanel";
import NewProcedureForm from "./NewProcedureForm";
import ProceduresList from "./ProceduresList";
import ProcedureDetail from "./ProcedureDetail";

export const dynamic = "force-dynamic";

async function getData(query: any) {
  const where: any = {};
  if (query.client) where.clientId = Number(query.client);
  if (query.status) where.status = query.status;
  if (query.region) where.region = query.region;
  if (query.province) where.province = query.province;
  
  // Filtros de categoría y tipo
  const category = query.category as ("ADMIN"|"JUDICIAL"|"OTROS"|"CORRETAJE"|undefined);
  if (category) {
    where.type = { startsWith: CATEGORY_PREFIX[category] };
  }
  if (query.type) {
    // Si viene type específico, predomina sobre categoría
    where.type = query.type;
  }
  
  // Filtros de tags
  const tagFilters: any[] = [];
  if (query.tagDelegable) tagFilters.push({ generalInfo: { contains: "#Delegable" } });
  if (query.tagPrioridad) tagFilters.push({ generalInfo: { contains: "#Prioridad" } });
  
  if (tagFilters.length) {
    where.AND = [...(where.AND ?? []), ...tagFilters];
  }
  
  const orderParam = (query.order ?? "lastActionAt_desc") as
    | "createdAt_asc"
    | "createdAt_desc"
    | "lastActionAt_asc"
    | "lastActionAt_desc";
  const [field, dir] = orderParam.split("_") as ["createdAt" | "lastActionAt", "asc" | "desc"];
  const sortDir: Prisma.SortOrder = dir;
  const orderBy: Prisma.ProcedureOrderByWithRelationInput[] =
    field === "createdAt"
      ? [{ createdAt: sortDir }]
      : [{ lastActionAt: sortDir }];
  
  const list = await prisma.procedure.findMany({ where, include: { client: true }, orderBy });
  let current = null;
  let ufRatesMap: Record<string, number> = {};
  
  if (query.id) {
    current = await prisma.procedure.findUnique({
      where: { id: Number(query.id) },
      include: {
        client: true,
        steps: { orderBy: { order: "asc" } },
        expenses: true,
        todos: true,
        waterRights: true,
        proposal: { include: { milestones: true } },
      }
    });
    if (current) {
      const dateKeys = new Set<string>();
      (current.expenses as any[]).forEach(e => { if (e.paidAt) dateKeys.add(new Date(e.paidAt).toISOString().slice(0,10)); });
      (current as any).proposal?.milestones?.forEach((m: any) => { if (m.triggeredAt) dateKeys.add(new Date(m.triggeredAt).toISOString().slice(0,10)); });
      if (dateKeys.size > 0) {
        const dates = Array.from(dateKeys).map(d => new Date(d));
        const rates = await prisma.uFRate.findMany({ where: { date: { in: dates } } });
        ufRatesMap = Object.fromEntries(rates.map((r: any) => [new Date(r.date).toISOString().slice(0,10), Number(r.value)]));
      }
    }
  }
  
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  return { list, current, clients, ufRatesMap };
}

export default async function GestionesPage({ searchParams }: { searchParams: any }) {
  const { list, current, clients, ufRatesMap } = await getData(searchParams);

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
          <FiltersPanel searchParams={searchParams} clients={clients} />
          
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
              searchParams={searchParams}
              ufRatesMap={ufRatesMap}
            />
          )}
        </div>
      </div>
    </main>
  );
}
