"use client";
import { useMemo, useState } from "react";
import { REGIONES } from "@/lib/cl-regiones";

type Props = {
  nameRegion?: string;
  nameProvince?: string;
  valueRegion?: string;
  valueProvince?: string;
  onChange?: (region: string, province: string) => void;
};

export default function RegionProvinciaSelect({
  nameRegion = "region",
  nameProvince = "province",
  valueRegion = "",
  valueProvince = "",
  onChange,
}: Props) {
  const [region, setRegion] = useState<string>(valueRegion || "");
  const [province, setProvince] = useState<string>(valueProvince || "");
  const provinces = useMemo(() => {
    const r = REGIONES.find(r => r.nombre === region);
    return r ? r.provincias : [];
  }, [region]);
  const handleRegionChange = (val: string) => {
    setRegion(val);
    setProvince("");
    onChange?.(val, "");
  };
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    onChange?.(region, val);
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      <select className="select-glass rounded-xl px-3 py-2 w-full" name={nameRegion} value={region} onChange={(e) => handleRegionChange(e.target.value)}>
        <option value="">— Región —</option>
        {REGIONES.map(r => <option key={r.nombre} value={r.nombre}>{r.nombre}</option>)}
      </select>
      <select className="select-glass rounded-xl px-3 py-2 w-full" name={nameProvince} value={province} onChange={(e) => handleProvinceChange(e.target.value)}>
        <option value="">— Provincia —</option>
        {provinces.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
      </select>
    </div>
  );
}


