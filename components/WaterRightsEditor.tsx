"use client";
import { useState } from "react";

type WaterRight = {
  naturaleza: "SUBTERRANEO" | "SUPERFICIAL";
  foja: string;
  numero: string;
  anio: number | "";
  cbr: string;
};

type Props = { name?: string };

export default function WaterRightsEditor({ name = "wr" }: Props) {
  const [items, setItems] = useState<WaterRight[]>([]);
  return (
    <div className="grid gap-2">
      <input type="hidden" name={`${name}[data]`} value={JSON.stringify(items)} />
      {items.map((w, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2">
                          <select className="select-glass" value={w.naturaleza}
                  onChange={e => update(idx, { ...w, naturaleza: e.target.value as any })}>
            <option value="SUBTERRANEO">Subterráneo</option>
            <option value="SUPERFICIAL">Superficial</option>
          </select>
                          <input className="input-glass" placeholder="Foja" value={w.foja}
                 onChange={e => update(idx, { ...w, foja: e.target.value })} />
                      <input className="input-glass" placeholder="Número" value={w.numero}
                 onChange={e => update(idx, { ...w, numero: e.target.value })} />
                      <input className="input-glass" placeholder="Año" type="number" value={w.anio}
                 onChange={e => update(idx, { ...w, anio: e.target.value ? Number(e.target.value) : "" })} />
          <div className="flex gap-2">
                          <input className="input-glass" placeholder="CBR" value={w.cbr}
                   onChange={e => update(idx, { ...w, cbr: e.target.value })} />
            <button type="button" className="btn-ghost" onClick={() => remove(idx)}>Eliminar</button>
          </div>
        </div>
      ))}
      <div>
        <button type="button" className="btn" onClick={() => setItems([...items, { naturaleza: "SUBTERRANEO", foja: "", numero: "", anio: "", cbr: "" }])}>Agregar derecho</button>
      </div>
    </div>
  );

  function update(index: number, value: WaterRight) {
    setItems(prev => prev.map((p, i) => (i === index ? value : p)));
  }
  function remove(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }
}


