import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateStepFromForm, addExpenseFromForm, addTodoFromForm, updateTodoFromForm, deleteTodoFromForm, updateProcedureMetaFromForm } from "./server-actions";
import SubmitButton from "@/components/SubmitButton";
import WaterRightsEditor from "@/components/WaterRightsEditor";
import { extractTags } from "@/lib/tags";
import ConfirmForm from "@/components/ConfirmForm";
import { toNumberDisplay } from "@/lib/decimal";

interface ProcedureDetailProps {
  procedureId: number;
}

// Helper functions
function fmtDate(d?: Date | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("es-CL"); } catch { return "—"; }
}

function fmtUF(v: any) {
  const n = toNumberDisplay(v, { fallback: NaN });
  return isNaN(n) ? "UF —" : `UF ${n.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function ProcedureDetail({ procedureId }: ProcedureDetailProps) {
  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId },
    include: {
      client: true,
      steps: { orderBy: { order: "asc" } },
      expenses: { orderBy: [{ paidAt: "desc" }, { id: "desc" }] },
      todos: { orderBy: [{ dueDate: "asc" }, { id: "desc" }] },
      waterRights: true,
    }
  });

  if (!procedure) return notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink mb-2">
              {procedure.title || procedure.type}
            </h2>
            <div className="text-sm text-ink-muted space-y-1">
              <div>Cliente: {procedure.client.name}</div>
              <div>Estado: <span className="chip chip-primary">{procedure.status}</span></div>
              {procedure.region && <div>Región: {procedure.region}{procedure.province && `, ${procedure.province}`}</div>}
              {procedure.generalInfo && <div>Info: {procedure.generalInfo}</div>}
              {(() => {
                const tags = extractTags(procedure.generalInfo);
                return !!tags.length && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(t => (
                      <span key={t} className="badge-glass rounded-full px-3 py-1 text-xs">{t}</span>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
          <Link href="/gestiones" className="btn-glass text-sm">
            ← Volver
          </Link>
        </div>
      </div>

      {/* Panel "Editar gestión" (estado + tags) */}
      <div className="glass rounded-2xl p-4 mb-5">
        <form action={updateProcedureMetaFromForm} className="grid grid-cols-12 gap-3 items-center">
          <input type="hidden" name="procedureId" value={procedure.id} />

          {/* Estado */}
          <div className="col-span-12 md:col-span-4">
            <label className="form-label text-xs block mb-1">Estado</label>
            <select name="status" defaultValue={procedure.status ?? "PENDING"} className="select-glass rounded-xl px-3 h-10 w-full">
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En proceso</option>
              <option value="DONE">Terminado</option>
            </select>
          </div>

          {/* Tags */}
          <div className="col-span-12 md:col-span-6">
            <div className="form-label text-xs mb-1">Tags</div>
            <div className="flex flex-wrap gap-2">
              {["#Delegable", "#Prioridad"].map(tag => {
                const has = (procedure.generalInfo ?? "").includes(tag);
                return (
                  <label key={tag} className="badge-glass rounded-full px-3 py-1 text-xs cursor-pointer select-none">
                    <input type="checkbox" name="tags[]" value={tag} defaultChecked={has} className="mr-2 align-middle" />
                    {tag}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Guardar */}
          <div className="col-span-12 md:col-span-2 flex md:justify-end">
            <button className="btn-glass rounded-xl px-4 h-10 w-full md:w-auto">Guardar</button>
          </div>
        </form>
      </div>

      {/* Steps Checklist */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-ink">Pasos de la gestión</h3>
        <div className="space-y-3">
          {procedure.steps.map((step) => (
            <div key={step.id} className="rounded-xl p-3 glass mb-3">
              <form action={updateStepFromForm} className="grid grid-cols-12 gap-3">
                <input type="hidden" name="stepId" value={step.id} />

                {/* Fila 1: checkbox + título (col 1-8) | fecha (col 9-12) */}
                <div className="col-span-12 md:col-span-8 flex items-center gap-3">
                  <input type="checkbox" name="done" defaultChecked={step.done} className="h-5 w-5" />
                  <div className="text-sm">{step.title}</div>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <label className="form-label text-xs block mb-1">Fecha</label>
                  <input
                    type="date"
                    name="doneAt"
                    defaultValue={step.doneAt ? new Date(step.doneAt).toISOString().slice(0,10) : ""}
                    className="input-glass rounded-xl px-3 h-10 w-full"
                  />
                </div>

                {/* Fila 2: comentario (col 1-9) | Guardar (col 10-12) */}
                <div className="col-span-12 md:col-span-9">
                  <label className="form-label text-xs block mb-1">Comentario</label>
                  <input
                    type="text"
                    name="comment"
                    defaultValue={step.comment ?? ""}
                    placeholder="Notas breves"
                    className="input-glass rounded-xl px-3 h-10 w-full"
                  />
                </div>
                <div className="col-span-12 md:col-span-3 flex md:justify-end">
                  <button className="btn-glass rounded-xl px-4 h-10 w-full md:w-auto">Guardar</button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-ink">Gastos</h3>
        <div className="space-y-2">
          {procedure.expenses.map((expense) => (
            <div key={expense.id} className="rounded-xl p-3 glass mb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {expense.reason}
                    <span className="text-ink-muted">
                      {" "}
                      ({expense.documentType}{expense.documentNumber ? ` #${expense.documentNumber}` : ""})
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {expense.organism ? `Organismo: ${expense.organism} · ` : ""}
                    {expense.paidAt ? `Pago: ${fmtDate(expense.paidAt)}` : "Sin pago"}
                    {expense.billedAt ? ` · Cobro cliente: ${fmtDate(expense.billedAt)}` : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold whitespace-nowrap">{fmtUF(expense.amountUF)}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Expense Form */}
        <form action={addExpenseFromForm} className="p-3 glass rounded-lg">
          <input type="hidden" name="procedureId" value={procedure.id} />
          <input type="hidden" name="redirectTo" value={`/gestiones?pid=${procedure.id}`} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-glass" name="reason" placeholder="Motivo del gasto" required />
            <input className="input-glass" name="amountUF" type="number" step="0.01" placeholder="Monto UF" required />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <select className="select-glass" name="documentType" defaultValue="OTRO">
              <option value="OTRO">Otro</option>
              <option value="FACTURA">Factura</option>
              <option value="BOLETA">Boleta</option>
              <option value="RECIBO">Recibo</option>
            </select>
            <input className="input-glass" name="documentNumber" placeholder="Número documento" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <input className="input-glass" name="organism" placeholder="Organismo" />
            <input className="input-glass" name="paidAt" type="date" placeholder="Fecha pago" />
          </div>
          <input className="input-glass mt-2" name="billedAt" type="date" placeholder="Fecha cobro cliente" />
          <SubmitButton label="Agregar gasto" pendingLabel="Agregando..." className="mt-2" />
        </form>
      </div>

      {/* Todos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-ink">Tareas pendientes</h3>
        
        {/* Add Todo Form - Layout simétrico */}
        <form action={addTodoFromForm} className="glass rounded-xl p-3 grid grid-cols-12 gap-3 mb-3">
          <input type="hidden" name="procedureId" value={procedure.id} />
          <input type="hidden" name="redirectTo" value={`/gestiones?pid=${procedure.id}`} />
          <div className="col-span-12 md:col-span-7">
            <input type="text" name="text" placeholder="Título de la tarea" className="input-glass rounded-xl px-3 h-10 w-full" required />
          </div>
          <div className="col-span-12 md:col-span-3">
            <input type="date" name="dueDate" className="input-glass rounded-xl px-3 h-10 w-full" />
          </div>
          <div className="col-span-12 md:col-span-2 flex md:justify-end">
            <button className="btn-glass rounded-xl px-4 h-10 w-full md:w-auto">Agregar tarea</button>
          </div>
        </form>
        
        <div className="space-y-3">
          {procedure.todos.map((todo) => (
            <div key={todo.id} className="rounded-xl p-3 glass mb-3">
              <form action={updateTodoFromForm} className="grid md:grid-cols-12 gap-3 items-start">
                <input type="hidden" name="todoId" value={todo.id} />

                <div className="md:col-span-1 flex justify-center">
                  <input type="checkbox" name="done" defaultChecked={todo.done} className="h-5 w-5" />
                </div>
                <div className="md:col-span-6">
                  <label className="form-label text-xs block mb-1">Tarea</label>
                  <input type="text" name="text" defaultValue={todo.text} className="input-glass rounded-xl px-3 h-10 w-full" />
                </div>
                <div className="md:col-span-3">
                  <label className="form-label text-xs block mb-1">Vencimiento</label>
                  <input type="date" name="dueDate" defaultValue={todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0,10) : ""} className="input-glass rounded-xl px-3 h-10 w-full" />
                </div>
                <div className="md:col-span-2 flex gap-2 md:justify-end">
                  <button className="btn-glass rounded-xl px-4 h-10 w-full md:w-auto">Guardar</button>
                  <ConfirmForm action={deleteTodoFromForm} hidden={{ todoId: todo.id }} confirmMessage="¿Eliminar To-Do?">
                    <button className="btn-glass rounded-xl px-3 h-10" aria-label="Eliminar To-Do">🗑️</button>
                  </ConfirmForm>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Water Rights */}
      {procedure.waterRights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-ink">Derechos de agua</h3>
          <div className="space-y-2">
            {procedure.waterRights.map((wr) => (
              <div key={wr.id} className="p-3 glass rounded-lg">
                <div className="text-sm text-ink">
                  {wr.naturaleza} - Foja {wr.foja}, N° {wr.numero} ({wr.anio}) - CBR: {wr.cbr}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Water Rights Editor */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-ink">Agregar derechos de agua</h3>
        <WaterRightsEditor />
      </div>
    </div>
  );
}
