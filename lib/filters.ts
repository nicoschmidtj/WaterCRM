import { zFilters } from "./validation";

export function parseFilters(searchParams: Record<string, any>) {
  const obj: Record<string, any> = {};
  for (const key in searchParams) {
    const val = searchParams[key];
    if (Array.isArray(val)) obj[key] = val[val.length - 1];
    else if (val !== undefined) obj[key] = val;
  }
  if (obj.tagDelegable === "1") obj.tagDelegable = true;
  if (obj.tagPrioridad === "1") obj.tagPrioridad = true;
  const res = zFilters.safeParse(obj);
  return res.success ? res.data : {};
}
