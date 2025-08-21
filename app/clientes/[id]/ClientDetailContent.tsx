"use client";

import { useState } from "react";
import Link from "next/link";
import { updateClientFromForm, createProcedure, createProposal, updateProposal, deleteProposal, createMilestone, updateMilestone, deleteMilestone } from "@/app/actions";
import ContactsEditor from "@/components/ContactsEditor";
import RegionProvinciaSelect from "@/components/RegionProvinciaSelect";
import TemplatePicker from "@/components/TemplatePicker";
import TypeSelector from "@/components/TypeSelector";
import WaterRightsEditor from "@/components/WaterRightsEditor";
import SubmitButton from "@/components/SubmitButton";
import Toast from "@/components/Toast";
import { extractTitleFromGeneralInfo, templateLabelForType, formatLastAction } from "@/lib/procedureDisplay";

interface ClientDetailContentProps {
  client: any;
  procedures: any[];
  proposals: any[];
  tab: string;
}

export default function ClientDetailContent({ client, procedures, proposals, tab }: ClientDetailContentProps) {
  const [showEditPanel, setShowEditPanel] = useState(false);

  return (
    <main className="grid gap-4">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{client.name}</h1>
          <div className="text-sm text-ink-700">{client.email || "—"} · {client.phone || "—"} · RUT: {client.rut}{client.alias ? ` · Alias: ${client.alias}` : ""}</div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowEditPanel(!showEditPanel)} 
            className="btn-glass"
          >
            {showEditPanel ? "Cancelar" : "Editar"}
          </button>
          <Link href="/clientes" className="btn-ghost">← Volver</Link>
        </div>
      </div>
      
      {/* Panel de Edición de Cliente */}
      {showEditPanel && (
        <div className="card glass">
          <h3 className="mb-4 font-medium">Editar cliente</h3>
          <form action={updateClientFromForm} className="grid gap-3">
            <input type="hidden" name="id" value={client.id} />
            <input type="hidden" name="redirectTo" value={`/clientes/${client.id}`} />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label block mb-1">RUT *</label>
                <input 
                  className="input-glass" 
                  name="rut" 
                  defaultValue={client.rut} 
                  required 
                />
              </div>
              <div>
                <label className="form-label block mb-1">Nombre *</label>
                <input 
                  className="input-glass" 
                  name="name" 
                  defaultValue={client.name} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label block mb-1">Alias</label>
                <input 
                  className="input-glass" 
                  name="alias" 
                  defaultValue={client.alias || ""} 
                />
              </div>
              <div>
                <label className="form-label block mb-1">Email</label>
                <input 
                  className="input-glass" 
                  name="email" 
                  type="email" 
                  defaultValue={client.email || ""} 
                />
              </div>
            </div>
            
            <div>
              <label className="form-label block mb-1">Teléfono</label>
              <input 
                className="input-glass" 
                name="phone" 
                defaultValue={client.phone || ""} 
              />
            </div>
            
            <div>
              <label className="form-label block mb-1">Contactos</label>
              <ContactsEditor 
                name="contacts" 
                defaultValue={client.contacts} 
              />
            </div>
            
            <div>
              <label className="form-label block mb-1">Notas</label>
              <textarea 
                className="textarea-glass" 
                name="notes" 
                rows={3} 
                defaultValue={client.notes || ""} 
              />
            </div>
            
            <div className="flex gap-2">
              <SubmitButton label="Guardar cambios" pendingLabel="Guardando…" />
              <button 
                type="button" 
                onClick={() => setShowEditPanel(false)} 
                className="btn-ghost"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="card">
        <div className="mb-4 flex gap-2">
          <Link className={tab === "info" ? "btn" : "btn-ghost"} href={`?tab=info`}>Información</Link>
          <Link className={tab === "gestiones" ? "btn" : "btn-ghost"} href={`?tab=gestiones`}>Gestiones</Link>
          <Link className={tab === "facturacion" ? "btn" : "btn-ghost"} href={`?tab=facturacion`}>Facturación</Link>
        </div>
        {tab === "info" && (
          <div className="grid gap-2 text-sm">
            <div><span className="text-ink-700">RUT:</span> {client.rut}</div>
            <div><span className="text-ink-700">Alias:</span> {client.alias || "—"}</div>
            <div>
              <span className="text-ink-700">Contactos:</span>
              <ul className="ml-4 list-disc">
                {(() => { try { return JSON.parse(client.contacts || "[]") } catch { return [] } })().map((c: any, i: number) => (
                  <li key={i}>
                    {c.nombre}
                    {c.cargo ? ` — ${c.cargo}` : ""}
                    {c.correo ? ` · ${c.correo}` : ""}
                    {c.telefono ? ` · ${c.telefono}` : ""}
                  </li>
                ))}
                {(!client.contacts || client.contacts === "[]") && <li className="text-ink-700">—</li>}
              </ul>
            </div>
            <div><span className="text-ink-700">Notas:</span> {client.notes || "—"}</div>
          </div>
        )}
        {tab === "gestiones" && (
          <div className="grid gap-4">
            <div>
              <h3 className="mb-2 font-medium">Gestiones del cliente</h3>
              <div className="grid gap-2">
                {procedures.map((p: any) => (
                  <Link key={p.id} href={`/gestiones?pid=${p.id}`} className="rounded-md border border-surface-300 bg-surface-200 p-3 hover:bg-surface-300">
                    <div className="text-sm font-medium">
                      {extractTitleFromGeneralInfo(p.generalInfo)} — {templateLabelForType(p.type)}
                    </div>
                    <div className="text-xs text-ink-700">
                      {p.region ?? "Región s/n"}{p.province ? ` (${p.province})` : ""} · Última acción: {formatLastAction(p.lastActionAt || p.createdAt)}
                    </div>
                  </Link>
                ))}
                {procedures.length === 0 && <div className="text-ink-700 text-sm">Sin gestiones.</div>}
              </div>
            </div>
            <div className="border-t border-surface-300 pt-4">
              <h3 className="mb-2 font-medium">Nueva gestión</h3>
              <form action={createProcedure} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input type="hidden" name="redirectTo" value={`/clientes/${client.id}?tab=gestiones`} />
                <input type="hidden" name="clientId" value={client.id} />
                
                {/* Template Picker */}
                <div className="md:col-span-2">
                  <TemplatePicker
                    nameMode="mode"
                    nameTemplateKey="templateKey"
                    nameIncludeGroups="includeGroups"
                    nameCustomSteps="customSteps"
                  />
                </div>
                
                {/* Type Selector - se maneja automáticamente según el modo */}
                <div className="md:col-span-2">
                  <TypeSelector 
                    mode="custom"
                    nameTypeHidden="type"
                  />
                </div>
                
                {/* Tags */}
                <div className="space-y-2">
                  <div className="form-label">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    <label className="badge-glass rounded-full px-3 py-1 text-xs cursor-pointer select-none">
                      <input type="checkbox" name="tags[]" value="#Delegable" className="mr-2 align-middle" />
                      #Delegable
                    </label>
                    <label className="badge-glass rounded-full px-3 py-1 text-xs cursor-pointer select-none">
                      <input type="checkbox" name="tags[]" value="#Prioridad" className="mr-2 align-middle" />
                      #Prioridad
                    </label>
                  </div>
                </div>
                                            <div><label className="form-label">Título (opcional)</label><input className="input-glass" name="title" /></div>
                <div className="md:col-span-2">
                                      <label className="form-label">Región y Provincia</label>
                  <RegionProvinciaSelect nameRegion="region" nameProvince="province" />
                </div>
                                            <div className="md:col-span-2"><label className="form-label">Datos generales (libre)</label><textarea className="textarea-glass" name="generalInfo" rows={3} /></div>
                                            <div><label className="form-label">Propuesta vinculada (opcional id)</label><input className="input-glass" name="proposalId" type="number" /></div>
                <div className="md:col-span-2">
                                      <label className="form-label">Derechos de agua (opcional)</label>
                  <WaterRightsEditor />
                </div>
                <div className="md:col-span-2"><SubmitButton label="Crear gestión" pendingLabel="Creando…" /></div>
              </form>
            </div>
          </div>
        )}
        {tab === "facturacion" && (
          <div className="grid gap-4">
            <div>
              <h3 className="mb-2 font-medium">Propuestas</h3>
              <form action={createProposal} className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
                <input type="hidden" name="clientId" value={client.id} />
                <input type="hidden" name="redirectTo" value={`/clientes/${client.id}?tab=facturacion`} />
                                            <input className="input-glass" name="title" placeholder="Título" required />
                            <input className="input-glass" name="totalFeeUF" type="number" step="0.01" placeholder="Total UF (opcional)" />
                            <input className="input-glass md:col-span-2" name="description" placeholder="Descripción (opcional)" />
                            <select className="select-glass" name="billingMode" defaultValue="HITOS">
                  <option value="HITOS">Hitos</option>
                  <option value="HORA">Hora</option>
                  <option value="MIXTO">Mixto</option>
                </select>
                <SubmitButton label="Crear propuesta" pendingLabel="Creando…" />
              </form>
              <div className="grid gap-2">
                {proposals.map((pp: any) => (
                  <div key={pp.id} className="rounded-md border border-surface-300 bg-surface-200 p-3">
                    <form action={updateProposal} className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm">
                      <input type="hidden" name="proposalId" value={pp.id} />
                                                        <input className="input-glass" name="title" defaultValue={pp.title} required />
                                  <input className="input-glass" name="totalFeeUF" type="number" step="0.01" defaultValue={pp.totalFeeUF ?? ""} />
                                  <input className="input-glass md:col-span-2" name="description" defaultValue={pp.description ?? ""} />
                                  <select className="select-glass" name="billingMode" defaultValue={pp.billingMode}>
                        <option value="HITOS">Hitos</option>
                        <option value="HORA">Hora</option>
                        <option value="MIXTO">Mixto</option>
                      </select>
                      <div className="flex gap-2">
                        <SubmitButton label="Guardar" pendingLabel="Guardando…" />
                        <button type="submit" className="btn-ghost text-red-700" formAction={deleteProposal} name="proposalId" value={pp.id}>Eliminar</button>
                      </div>
                    </form>
                    <div className="mt-2 rounded bg-surface-300 p-2">
                      <div className="mb-2 text-xs text-ink-700">Hitos</div>
                      <ul className="mb-2 space-y-1 text-xs">
                        {pp.milestones.map((m: any) => (
                          <li key={m.id} className="rounded border border-surface-300 p-2">
                            <form action={updateMilestone} className="grid grid-cols-2 gap-2">
                              <input type="hidden" name="milestoneId" value={m.id} />
                                                                        <input className="input-glass" name="title" defaultValue={m.title} required />
                                          <input className="input-glass" name="feeUF" type="number" step="0.01" defaultValue={m.feeUF ?? ""} />
                                          <input className="input-glass" name="dueDate" type="date" defaultValue={m.dueDate ? new Date(m.dueDate).toISOString().slice(0,10) : ""} />
                                          <input className="input-glass" name="triggeredAt" type="date" defaultValue={m.triggeredAt ? new Date(m.triggeredAt).toISOString().slice(0,10) : ""} />
                              <label className="flex items-center gap-2">
                                <input type="checkbox" name="isTriggered" defaultChecked={m.isTriggered} />
                                <span>Cumplido</span>
                              </label>
                                                                        <input className="input-glass" name="note" defaultValue={m.note ?? ""} placeholder="Nota" />
                              <div className="flex gap-2">
                                <SubmitButton label="Guardar" pendingLabel="Guardando…" />
                                <button type="submit" className="btn-ghost text-red-700" formAction={deleteMilestone} name="milestoneId" value={m.id}>Eliminar</button>
                              </div>
                            </form>
                          </li>
                        ))}
                      </ul>
                      <form action={createMilestone} className="grid grid-cols-2 gap-2">
                        <input type="hidden" name="proposalId" value={pp.id} />
                        <input type="hidden" name="clientId" value={client.id} />
                        <input type="hidden" name="redirectTo" value={`/clientes/${client.id}?tab=facturacion`} />
                                                            <input className="input-glass" name="title" placeholder="Título" required />
                                    <input className="input-glass" name="feeUF" type="number" step="0.01" placeholder="UF" />
                                    <input className="input-glass" name="dueDate" type="date" placeholder="Fecha límite" />
                                    <input className="input-glass" name="note" placeholder="Nota" />
                        <SubmitButton label="Crear hito" pendingLabel="Creando…" />
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
