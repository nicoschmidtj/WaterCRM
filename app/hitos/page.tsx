import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { fmtCLP } from "@/lib/utils";
import { formatUF, toNumberSafe } from "@/lib/decimal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getData(query: Record<string, string | string[] | undefined>) {
  const whereMilestone: Prisma.MilestoneWhereInput = {};
  const whereProcedure: Prisma.ProcedureWhereInput = {};
  if (query.client) whereProcedure.clientId = Number(query.client);
  if (query.procedure) whereProcedure.id = Number(query.procedure);
  if (query.status === "done") whereMilestone.isTriggered = true;
  if (query.status === "pending") whereMilestone.isTriggered = false;

  const month = query.month ? Number(query.month) : undefined;
  const year = query.year ? Number(query.year) : undefined;

  const proposals = await prisma.proposal.findMany({
    where: { clientId: query.client ? Number(query.client) : undefined },
    include: {
      client: true,
      procedures: query.procedure ? { where: { id: Number(query.procedure) } } : true,
      milestones: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Construir UF rates map
  const dateKeys = new Set<string>();
  proposals.forEach(p => {
    p.milestones.forEach(m => {
      if (m.triggeredAt) dateKeys.add(m.triggeredAt.toISOString().slice(0,10));
    });
  });
  const dates = Array.from(dateKeys).map(d => new Date(d));
  const rates = dates.length ? await prisma.uFRate.findMany({ where: { date: { in: dates } } }) : [];
  const ufRatesMap: Record<string, number> = Object.fromEntries(
    rates
      .map((r) => [new Date(r.date).toISOString().slice(0, 10), toNumberSafe(r.value)])
      .filter(([, v]) => v !== null)
  );

  // Aplanar milestones con contexto
  const rows = proposals.flatMap(p => p.milestones
    .filter(m => {
      if (whereMilestone.isTriggered !== undefined && m.isTriggered !== whereMilestone.isTriggered) return false;
      if (month && year) {
        const ref = m.isTriggered ? m.triggeredAt : m.dueDate;
        if (!ref) return false;
        const d = new Date(ref);
        if (d.getUTCFullYear() !== year || d.getUTCMonth() + 1 !== month) return false;
      }
      return true;
    })
    .map(m => {
      let clp: number | null = null;
      const fee = toNumberSafe(m.feeUF);
      if (fee !== null) {
        const d = m.isTriggered ? m.triggeredAt : m.dueDate;
        if (d) {
          const key = d.toISOString().slice(0, 10);
          const rateExact = ufRatesMap[key];
          if (rateExact !== undefined) clp = fee * rateExact;
        }
      }
      return {
        client: p.client?.name ?? "—",
        procedure: query.procedure
          ? p.procedures[0]?.title || p.procedures[0]?.type || "—"
          : (p.procedures.length > 1 ? "(múltiples)" : (p.procedures[0]?.title || p.procedures[0]?.type || "—")),
        proposal: p.title,
        milestone: m.title,
        feeUF: formatUF(m.feeUF),
        clp,
        date: m.isTriggered ? m.triggeredAt : m.dueDate,
        status: m.isTriggered ? "cumplido" : "pendiente",
      };
    })
  );

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  const procedures = await prisma.procedure.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true, type: true } });
  return { rows, clients, procedures };
}

export default async function HitosPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { rows, clients, procedures } = await getData(searchParams);
  
  return (
    <main className="space-y-6">
      <Card className="glass">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-medium tracking-wide">Consolidado de Hitos</h1>
          <span className="text-sm text-ink-muted">{rows.length} hitos</span>
        </div>
        
        <form className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Cliente</label>
            <select className="select-glass rounded-xl px-3 py-2 w-full" name="client" defaultValue={searchParams.client || ""}>
              <option value="">Todos</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Gestión</label>
            <select className="select-glass rounded-xl px-3 py-2 w-full" name="procedure" defaultValue={searchParams.procedure || ""}>
              <option value="">Todas</option>
              {procedures.map((p) => <option key={p.id} value={p.id}>{p.title || p.type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Mes</label>
            <input className="input-glass" name="month" type="number" min="1" max="12" defaultValue={searchParams.month || ""} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Año</label>
            <input className="input-glass" name="year" type="number" min="2000" max="2100" defaultValue={searchParams.year || ""} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Estado</label>
            <select className="select-glass rounded-xl px-3 py-2 w-full" name="status" defaultValue={searchParams.status || ""}>
              <option value="">Todos</option>
              <option value="done">Cumplidos</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
          <div className="md:col-span-1 col-span-2">
            <Button type="submit" className="btn-glass w-full">Filtrar</Button>
          </div>
        </form>
        
        <div className="overflow-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Gestión</th>
                <th>Propuesta</th>
                <th>Hito</th>
                <th>UF</th>
                <th>CLP</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx: number) => (
                <tr key={idx} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="font-medium text-ink">{r.client}</td>
                  <td>{r.procedure}</td>
                  <td>{r.proposal}</td>
                  <td>{r.milestone}</td>
                  <td>{r.feeUF ?? "—"}</td>
                  <td className="font-mono">{r.clp ? fmtCLP(r.clp) : "—"}</td>
                  <td>{r.date ? new Date(r.date).toLocaleDateString("es-CL") : "—"}</td>
                  <td>
                    <Chip 
                      variant={r.status === "cumplido" ? "success" : "warning"} 
                      size="sm"
                    >
                      {r.status}
                    </Chip>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="text-center py-8 text-ink-muted" colSpan={8}>
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}


