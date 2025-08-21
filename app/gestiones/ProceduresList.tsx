"use client";

import { useState } from "react";
import Link from "next/link";
import { fmtCLP } from "@/lib/utils";
import { STATUS } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { 
  updateStepFromForm, 
  addExpenseFromForm, 
  addTodoFromForm, 
  addWaterRightFromForm,
  updateProcedureInfoFromForm,
  updateProcedureStatusFromForm
} from "./server-actions";
import { deleteProcedureFromForm } from "@/app/actions";
import ConfirmForm from "@/components/ConfirmForm";
import { extractTags } from "@/lib/tags";
import { extractTitleFromGeneralInfo, templateLabelForType, formatLastAction } from "@/lib/procedureDisplay";

interface ProceduresListProps {
  procedures: any[];
  current: any;
  searchParams: any;
  ufRatesMap: Record<string, number>;
}

export default function ProceduresList({ 
  procedures, 
  current, 
  searchParams,
  ufRatesMap
}: ProceduresListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(current?.id || null);

  return (
    <Card className="glass rounded-2xl p-5 h-[calc(100vh-160px)] overflow-auto">
      <h3 className="text-base md:text-lg font-medium mb-4">Lista de gestiones</h3>
      
      <div className="space-y-3">
        {procedures.length > 0 ? (
          procedures.map((p: any) => (
            <div key={p.id} className="space-y-3">
              {/* Procedure Summary */}
              <Link 
                href={{ 
                  pathname: "/gestiones", 
                  query: { ...searchParams, pid: p.id } 
                }}
                className={`block p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all ${
                  current?.id === p.id ? 'border-blue-400/30 bg-blue-500/10' : ''
                }`}
              >
                                 <div className="flex items-center justify-between mb-2">
                   <div className="text-sm font-medium text-ink">
                     {extractTitleFromGeneralInfo(p.generalInfo)} — {templateLabelForType(p.type)}
                   </div>
                   <Chip 
                     variant={p.status === 'DONE' ? 'success' : p.status === 'IN_PROGRESS' ? 'primary' : 'default'} 
                     size="sm"
                   >
                     {p.status}
                   </Chip>
                 </div>
                 <div className="text-xs text-ink-muted">
                   {p.client?.name ?? "Cliente s/n"}
                 </div>
                 <div className="text-xs text-ink-muted">
                   {p.region ?? "Región s/n"}{p.province ? ` (${p.province})` : ""} · Última acción: {formatLastAction(p.lastActionAt || p.createdAt)}
                 </div>
                 {(() => {
                   const tags = extractTags(p.generalInfo);
                   return !!tags.length && (
                     <div className="flex flex-wrap gap-2 mt-2">
                       {tags.map(t => (
                         <span key={t} className="badge-glass rounded-full px-3 py-1 text-xs">{t}</span>
                       ))}
                     </div>
                   );
                 })()}
              </Link>

              {/* Expanded Detail */}
              {expandedId === p.id && current?.id === p.id && (
                <div className="ml-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-ink">{current.title || current.type}</h4>
                      <div className="text-xs text-ink-muted">
                        {current.client?.name} · {current.region || "—"} {current.province ? `(${current.province})` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={updateProcedureStatusFromForm} className="flex items-center gap-2">
                        <input type="hidden" name="procedureId" value={current.id} />
                                                 <select className="select-glass rounded-xl px-3 py-2 w-full text-xs" name="status" defaultValue={current.status}>
                           {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                        <Button type="submit" size="sm" className="btn-glass text-xs">Guardar</Button>
                      </form>
                                             <ConfirmForm action={deleteProcedureFromForm}
                         hidden={{ procedureId: current.id, redirectTo: "/gestiones" }}
                         confirmMessage="¿Eliminar esta gestión?">
                         <button className="btn-glass rounded-xl p-2 text-red-400 hover:text-red-300" aria-label="Eliminar gestión">
                           🗑️
                         </button>
                       </ConfirmForm>
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Datos generales */}
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                      <h5 className="text-xs font-medium text-ink mb-2">Datos generales</h5>
                      <form action={updateProcedureInfoFromForm} className="space-y-2">
                        <input type="hidden" name="procedureId" value={current.id} />
                        <textarea className="textarea-glass text-xs" name="generalInfo" rows={3} defaultValue={current.generalInfo || ""} />
                        <Button type="submit" size="sm" className="btn-glass text-xs">Guardar</Button>
                      </form>
                    </div>

                    {/* Derechos de agua */}
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                      <h5 className="text-xs font-medium text-ink mb-2">Derechos de agua</h5>
                      <div className="space-y-2 mb-3">
                        {current.waterRights.map((w: any) => (
                          <div key={w.id} className="p-2 rounded-lg border border-white/10 bg-white/5">
                            <div className="text-xs">
                              {w.foja} · Nº {w.numero} · {w.anio} · {w.cbr} · {w.naturaleza}
                            </div>
                          </div>
                        ))}
                        {current.waterRights.length === 0 && (
                          <div className="text-xs text-ink-muted text-center py-2">Sin derechos agregados.</div>
                        )}
                      </div>
                      <form action={addWaterRightFromForm} className="grid grid-cols-2 gap-2">
                        <input type="hidden" name="procedureId" value={current.id} />
                        <input className="input-glass text-xs" name="foja" placeholder="Foja" required />
                        <input className="input-glass text-xs" name="numero" placeholder="Número" required />
                        <input className="input-glass text-xs" name="anio" type="number" placeholder="Año" required />
                        <input className="input-glass text-xs" name="cbr" placeholder="CBR" required />
                                                 <select className="select-glass rounded-xl px-3 py-2 w-full text-xs" name="naturaleza">
                           <option value="SUBTERRANEO">Subterráneo</option>
                           <option value="SUPERFICIAL">Superficial</option>
                         </select>
                        <Button type="submit" size="sm" className="btn-glass text-xs col-span-2">Agregar</Button>
                      </form>
                    </div>

                    {/* Checklist y To-Dos */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                        <h5 className="text-xs font-medium text-ink mb-2">Checklist (etapas)</h5>
                        <div className="space-y-2">
                          {current.steps.map((s: any) => (
                            <div key={s.id} className="p-2 rounded-lg border border-white/10 bg-white/5">
                              <form action={updateStepFromForm} className="space-y-2">
                                <input type="hidden" name="stepId" value={s.id} />
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-2">
                                    <input type="checkbox" name="done" defaultChecked={s.done} className="text-xs" />
                                    <span className="text-xs font-medium">{s.title}</span>
                                  </label>
                                  <Button type="submit" size="sm" className="btn-glass text-xs">Guardar</Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <input className="input-glass text-xs" type="date" name="doneAt" defaultValue={s.doneAt ? new Date(s.doneAt).toISOString().slice(0,10) : ""} />
                                  <input className="input-glass text-xs" name="comment" placeholder="Comentario" defaultValue={s.comment || ""} />
                                </div>
                                {current.proposalId && current.proposal?.milestones && (
                                                                     <select name="milestoneId" className="select-glass rounded-xl px-3 py-2 w-full text-xs" defaultValue={s.milestoneId ?? ""}>
                                     <option value="">Sin hito</option>
                                     {current.proposal.milestones.map((m: any) => (
                                       <option key={m.id} value={m.id}>{m.title}{m.isTriggered ? " (cumplido)" : ""}</option>
                                     ))}
                                   </select>
                                )}
                              </form>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                        <h5 className="text-xs font-medium text-ink mb-2">To-Do con vencimiento</h5>
                        <div className="space-y-2 mb-3">
                          {current.todos.map((t: any) => (
                            <div key={t.id} className="p-2 rounded-lg border border-white/10 bg-white/5">
                              <div className="text-xs">
                                {t.text} · {t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-CL") : "sin fecha"}
                              </div>
                            </div>
                          ))}
                          {current.todos.length === 0 && (
                            <div className="text-xs text-ink-muted text-center py-2">Sin to-dos.</div>
                          )}
                        </div>
                        <form action={addTodoFromForm} className="grid grid-cols-2 gap-2">
                          <input type="hidden" name="procedureId" value={current.id} />
                          <input className="input-glass text-xs" name="text" placeholder="Tarea…" required />
                          <input className="input-glass text-xs" type="date" name="dueDate" />
                          <Button type="submit" size="sm" className="btn-glass text-xs col-span-2">Agregar</Button>
                        </form>
                      </div>
                    </div>

                    {/* Gastos */}
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                      <h5 className="text-xs font-medium text-ink mb-2">Gastos</h5>
                      <div className="space-y-2 mb-3">
                        {current.expenses.map((e: any) => {
                          const paidDate = e.paidAt ? new Date(e.paidAt) : null;
                          const key = paidDate ? paidDate.toISOString().slice(0,10) : null;
                          const rate = key ? ufRatesMap[key] : undefined;
                          const clp = rate ? Number(e.amountUF) * rate : null;
                          return (
                            <div key={e.id} className="p-2 rounded-lg border border-white/10 bg-white/5">
                              <div className="text-xs">
                                {e.reason} · {Number(e.amountUF)} UF {rate ? `(≈ ${fmtCLP(clp)})` : "(UF sin tasa)"} · {e.documentType} {e.documentNumber || ""} · {paidDate ? paidDate.toLocaleDateString("es-CL") : "—"}
                              </div>
                            </div>
                          );
                        })}
                        {current.expenses.length === 0 && (
                          <div className="text-xs text-ink-muted text-center py-2">Sin gastos.</div>
                        )}
                      </div>
                      <form action={addExpenseFromForm} className="grid grid-cols-2 gap-2">
                        <input type="hidden" name="procedureId" value={current.id} />
                        <input className="input-glass text-xs" name="reason" placeholder="Motivo/Documento" required />
                                                 <select className="select-glass rounded-xl px-3 py-2 w-full text-xs" name="documentType">
                           <option value="BOLETA">Boleta</option>
                           <option value="FACTURA">Factura</option>
                           <option value="OTRO">Otro</option>
                         </select>
                        <input className="input-glass text-xs" name="documentNumber" placeholder="Nº boleta/factura" />
                        <input className="input-glass text-xs" name="amountUF" type="number" step="0.01" placeholder="Monto UF" required />
                        <input className="input-glass text-xs" name="organism" placeholder="Organismo (opcional)" />
                        <input className="input-glass text-xs" type="date" name="paidAt" placeholder="Pago organismo" />
                        <input className="input-glass text-xs" type="date" name="billedAt" placeholder="Cobro cliente" />
                        <Button type="submit" size="sm" className="btn-glass text-xs col-span-2">Agregar gasto</Button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-ink-muted">No hay gestiones.</div>
        )}
      </div>
    </Card>
  );
}
