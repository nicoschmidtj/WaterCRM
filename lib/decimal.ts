import { Prisma } from "@prisma/client";

interface HasToNumber {
  toNumber: () => number | string;
}

export function toNumberDisplay(d: any, opts?: { fallback?: number }) {
  try {
    if (d instanceof Prisma.Decimal) return d.toNumber();
    if (d && typeof d === "object" && "toNumber" in d) {
      return Number((d as HasToNumber).toNumber());
    }
    const n = Number(d);
    return isNaN(n) ? (opts?.fallback ?? NaN) : n;
  } catch {
    return opts?.fallback ?? NaN;
  }
}

export function toNumberSafe(d: any): number | null {
  try {
    if (d == null) return null;
    if (d instanceof Prisma.Decimal) return d.toNumber();
    if (d && typeof d === "object" && "toNumber" in d) {
      return Number((d as HasToNumber).toNumber());
    }
    const n = Number(d);
    return isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

export function formatUF(d: any): string {
  const n = toNumberSafe(d);
  if (n === null) return "UF —";
  return `UF ${n.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function sumDecimals(a: any, b: any) {
  return new Prisma.Decimal(a ?? 0).add(b ?? 0);
}
