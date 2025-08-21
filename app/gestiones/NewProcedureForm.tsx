"use client";

import { useState } from "react";
import { createClientAndProcedure } from "@/app/actions";
import RegionProvinciaSelect from "@/components/RegionProvinciaSelect";
import TemplatePicker from "@/components/TemplatePicker";
import TypeSelector from "@/components/TypeSelector";
import { PROCEDURE_TYPES } from "@/lib/constants";
import SubmitButton from "@/components/SubmitButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface NewProcedureFormProps {
  clients: any[];
}

export default function NewProcedureForm({ clients }: NewProcedureFormProps) {
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [templateMode, setTemplateMode] = useState<'repo' | 'custom'>('repo');

  return (
    <Card className="glass">
      <h3 className="text-base md:text-lg font-medium mb-4">Nueva gestión</h3>
      
      <form action={createClientAndProcedure} className="space-y-4">
        <input type="hidden" name="redirectTo" value="/gestiones" />
        
        {/* Client Mode Selection */}
        <div className="space-y-2">
                          <label className="form-label block mb-2">Modo de cliente:</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="clientMode" 
                value="existing" 
                checked={clientMode === 'existing'}
                onChange={() => setClientMode('existing')}
              />
              <span className="text-sm">Cliente existente</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="clientMode" 
                value="new" 
                checked={clientMode === 'new'}
                onChange={() => setClientMode('new')}
              />
              <span className="text-sm">Cliente nuevo</span>
            </label>
          </div>
        </div>

        {/* Existing Client Selection */}
        {clientMode === 'existing' && (
          <div>
                            <label className="form-label block mb-1">Cliente existente</label>
            <select className="select-glass rounded-xl px-3 py-2 w-full" name="clientId">
              <option value="">Seleccionar cliente...</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* New Client Fields */}
        {clientMode === 'new' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input-glass" name="rut" placeholder="RUT" required />
              <input className="input-glass" name="name" placeholder="Nombre" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-glass" name="alias" placeholder="Alias" />
              <input className="input-glass" name="email" placeholder="Email" />
            </div>
            <input className="input-glass" name="phone" placeholder="Teléfono" />
          </div>
        )}

        {/* Template Picker */}
        <TemplatePicker
          nameMode="mode"
          nameTemplateKey="templateKey"
          nameIncludeGroups="includeGroups"
          nameCustomSteps="customSteps"
          modeDefault={templateMode}
          onModeChange={setTemplateMode}
        />

                 {/* Procedure Fields */}
         <div className="space-y-3">
           {/* Type Selector - solo visible en modo custom */}
           {templateMode === 'custom' && (
             <TypeSelector 
               mode="custom"
               nameTypeHidden="type"
             />
           )}
           
           <RegionProvinciaSelect nameRegion="region" nameProvince="province" />
           
           <input className="input-glass" name="title" placeholder="Título (opcional)" />
           <textarea className="textarea-glass" name="generalInfo" rows={3} placeholder="Datos generales (libre)" />
           
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
         </div>
        
        <SubmitButton label="Crear gestión" pendingLabel="Creando…" />
      </form>
    </Card>
  );
}
