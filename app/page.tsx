import { prisma } from "@/lib/prisma";
import Toast from "@/components/Toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getData() {
  const [todos, active, pending, done] = await Promise.all([
    prisma.todo.findMany({ where: { done: false }, include: { procedure: { include: { client: true } } }, orderBy: { dueDate: "asc" } }),
    prisma.procedure.count({ where: { status: "IN_PROGRESS" } }),
    prisma.procedure.count({ where: { status: "PENDING" } }),
    prisma.procedure.count({ where: { status: "DONE" } }),
  ]);
  return { todos, active, pending, done };
}

export default async function Dashboard() {
  const { todos, active, pending, done } = await getData();
  const today = new Date();

  return (
    <main className="space-y-6">
      <Toast />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass text-center">
          <div className="text-2xl font-semibold text-ink mb-1">{active}</div>
          <div className="text-sm text-ink-muted">En proceso</div>
        </Card>
        <Card className="glass text-center">
          <div className="text-2xl font-semibold text-ink mb-1">{pending}</div>
          <div className="text-sm text-ink-muted">Pendientes</div>
        </Card>
        <Card className="glass text-center">
          <div className="text-2xl font-semibold text-ink mb-1">{done}</div>
          <div className="text-sm text-ink-muted">Terminados</div>
        </Card>
        <Card className="glass text-center">
          <div className="text-2xl font-semibold text-ink mb-1">{todos.length}</div>
          <div className="text-sm text-ink-muted">Tareas pendientes</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Alertas y pendientes */}
        <Card className="glass lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-medium tracking-wide">Alertas y pendientes</h2>
            <Link href="/gestiones" className="text-sm text-ink-muted hover:text-ink transition-colors">
              ver gestiones →
            </Link>
          </div>
          
          {todos.length === 0 && (
            <div className="text-ink-muted text-center py-8">Sin pendientes por ahora.</div>
          )}
          
          <div className="space-y-3">
            {todos.map((t: any) => {
              const overdue = t.dueDate && new Date(t.dueDate) < today;
              return (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium text-ink">{t.text}</div>
                      {overdue && <Chip variant="error" size="sm">Vencida</Chip>}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-CL") : "Sin fecha"} — {t.procedure?.client?.name ?? "—"} ({t.procedure?.type})
                    </div>
                  </div>
                  <Button size="sm" pill variant="primary" className="btn-glass" asChild>
                    <Link href={`/gestiones?id=${t.procedureId}`}>Ir</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Acciones rápidas */}
        <Card className="glass">
          <h3 className="text-base md:text-lg font-medium mb-4">Acciones rápidas</h3>
          <div className="space-y-3">
            <Button variant="primary" pill className="btn-glass w-full" asChild>
              <Link href="/clientes">Nuevo cliente</Link>
            </Button>
            <Button variant="secondary" pill className="btn-glass w-full" asChild>
              <Link href="/gestiones">Nueva gestión</Link>
            </Button>
            <Button variant="ghost" pill className="btn-glass w-full" asChild>
              <Link href="/hitos">Ver hitos</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
