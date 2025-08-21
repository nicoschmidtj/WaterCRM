import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { STATUS } from "@/lib/constants";
import { PROCEDURE_TYPES } from "@/lib/constants";
import { TEMPLATES, CATEGORY_LABELS, groupTemplatesByCategory, type TemplateCategory } from "@/lib/procedureRepo";
import RegionProvinciaSelect from "@/components/RegionProvinciaSelect";

interface FiltersPanelProps {
  searchParams: any;
  clients: any[];
}

export default function FiltersPanel({ searchParams, clients }: FiltersPanelProps) {
  return (
    <Card className="glass">
      <h3 className="text-base md:text-lg font-medium mb-4">Filtros</h3>
      
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Cliente</label>
            <select className="select-glass rounded-xl px-3 py-2 w-full" name="client" defaultValue={searchParams.client || ""}>
              <option value="">Todos</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Estado</label>
            <select className="select-glass rounded-xl px-3 py-2 w-full" name="status" defaultValue={searchParams.status || ""}>
              <option value="">Todos</option>
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
                     {/* Categoría */}
           <div className="space-y-2">
             <div className="form-label">Categoría</div>
             <select name="category" defaultValue={searchParams.category ?? ""} className="select-glass rounded-xl px-3 py-2 w-full">
               <option value="">Todas</option>
               <option value="ADMIN">Administrativo</option>
               <option value="JUDICIAL">Judicial</option>
               <option value="OTROS">Otros</option>
               <option value="CORRETAJE">Corretaje</option>
             </select>
           </div>
           
           {/* Tipo agrupado por categoría */}
           <div className="space-y-2">
             <div className="form-label">Tipo</div>
             <select name="type" defaultValue={searchParams.type ?? ""} className="select-glass rounded-xl px-3 py-2 w-full">
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
               valueRegion={searchParams.region ?? ""}
               valueProvince={searchParams.province ?? ""}
             />
           </div>
           
           {/* Tags */}
           <div className="space-y-2">
             <div className="form-label">Tags</div>
             <label className="flex items-center gap-2 text-sm">
               <input type="checkbox" name="tagDelegable" defaultChecked={searchParams.tagDelegable === "1"} />
               <span>#Delegable</span>
             </label>
             <label className="flex items-center gap-2 text-sm">
               <input type="checkbox" name="tagPrioridad" defaultChecked={searchParams.tagPrioridad === "1"} />
               <span>#Prioridad</span>
             </label>
           </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Orden</label>
            <select className="select-glass rounded-xl px-3 py-2 w-full" name="order" defaultValue={searchParams.order || "lastActionAt_desc"}>
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
