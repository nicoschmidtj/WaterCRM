import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { STATUS } from "@/lib/constants";
import { TEMPLATES, CATEGORY_LABELS, groupTemplatesByCategory, type TemplateCategory } from "@/lib/procedureRepo";
import RegionProvinciaSelect from "@/components/RegionProvinciaSelect";
import type { Filters } from "@/lib/filters";

interface FiltersPanelProps {
  searchParams: Filters;
  clients: any[];
}

export default function FiltersPanel({ searchParams, clients }: FiltersPanelProps) {
  const params = searchParams;
  return (
    <Card className="glass">
      <h3 className="text-base md:text-lg font-medium mb-4">Filtros</h3>
      
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="filtro-cliente" className="block text-xs font-medium text-ink mb-1">Cliente</label>
            <select id="filtro-cliente" className="select-glass rounded-xl px-3 py-2 w-full" name="client" defaultValue={params.client || ""}>
              <option value="">Todos</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-estado" className="block text-xs font-medium text-ink mb-1">Estado</label>
            <select id="filtro-estado" className="select-glass rounded-xl px-3 py-2 w-full" name="status" defaultValue={params.status || ""}>
              <option value="">Todos</option>
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
                     {/* Categoría */}
           <div className="space-y-2">
             <label htmlFor="filtro-categoria" className="form-label">Categoría</label>
             <select id="filtro-categoria" name="category" defaultValue={params.category ?? ""} className="select-glass rounded-xl px-3 py-2 w-full">
               <option value="">Todas</option>
               <option value="ADMIN">Administrativo</option>
               <option value="JUDICIAL">Judicial</option>
               <option value="OTROS">Otros</option>
               <option value="CORRETAJE">Corretaje</option>
             </select>
           </div>

           {/* Tipo agrupado por categoría */}
           <div className="space-y-2">
             <label htmlFor="filtro-tipo" className="form-label">Tipo</label>
             <select id="filtro-tipo" name="type" defaultValue={params.type ?? ""} className="select-glass rounded-xl px-3 py-2 w-full">
               <option value="">Todos</option>
               {Object.entries(groupTemplatesByCategory()).map(([cat, arr]) => (
                 <optgroup key={cat} label={CATEGORY_LABELS[cat as TemplateCategory]}>
                   {arr.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                 </optgroup>
               ))}
             </select>
           </div>
                     <div className="space-y-2">
             <div className="form-label">Región / Provincia</div>
             <RegionProvinciaSelect
               nameRegion="region"
               nameProvince="province"
               valueRegion={params.region ?? ""}
               valueProvince={params.province ?? ""}
             />
           </div>
           
           {/* Tags */}
           <div className="space-y-2">
             <div className="form-label">Tags</div>
             <div className="flex items-center gap-2 text-sm">
               <input id="filtro-tagDelegable" type="checkbox" name="tagDelegable" defaultChecked={params.tagDelegable === true} />
               <label htmlFor="filtro-tagDelegable">#Delegable</label>
             </div>
             <div className="flex items-center gap-2 text-sm">
               <input id="filtro-tagPrioridad" type="checkbox" name="tagPrioridad" defaultChecked={params.tagPrioridad === true} />
               <label htmlFor="filtro-tagPrioridad">#Prioridad</label>
             </div>
           </div>
          <div>
            <label htmlFor="filtro-orden" className="block text-xs font-medium text-ink mb-1">Orden</label>
            <select id="filtro-orden" className="select-glass rounded-xl px-3 py-2 w-full" name="order" defaultValue={params.order || "lastActionAt_desc"}>
              <option value="createdAt_desc">Creación ↓</option>
              <option value="lastActionAt_desc">Últ. acción ↓</option>
              <option value="lastActionAt_asc">Últ. acción ↑</option>
            </select>
          </div>
        </div>
        
        <Button type="submit" className="btn-glass w-full">Aplicar filtros</Button>
      </form>
    </Card>
  );
}
