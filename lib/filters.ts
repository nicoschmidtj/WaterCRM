import { zFilters } from "./validation";
import type { z } from "zod";

export type Filters = z.infer<typeof zFilters>;

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): Filters {
  const obj: Record<string, unknown> = {};
  for (const key in searchParams) {
    const val = searchParams[key];
    if (Array.isArray(val)) obj[key] = val[val.length - 1];
    else if (val !== undefined) obj[key] = val;
  }
  if (obj.tagDelegable === "1") obj.tagDelegable = true;
  if (obj.tagPrioridad === "1") obj.tagPrioridad = true;
  const res = zFilters.safeParse(obj);
  return res.success ? res.data : {} as Filters;
}
