import { Prisma } from "@prisma/client";

export function toNumberDisplay(d: any, opts?: { fallback?: number }) {
  try {
    if (d instanceof Prisma.Decimal) return d.toNumber();
    if (d && typeof d === "object" && "toNumber" in d) {
      return Number((d as any).toNumber());
    }
    const n = Number(d);
    return isNaN(n) ? (opts?.fallback ?? NaN) : n;
  } catch {
    return opts?.fallback ?? NaN;
  }
}

export function sumDecimals(a: any, b: any) {
  return new Prisma.Decimal(a ?? 0).add(b ?? 0);
}
