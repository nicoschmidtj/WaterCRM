export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
import { toNumberDisplay } from "./decimal";

export function fmtUF(n?: any) {
  const val = toNumberDisplay(n, { fallback: NaN });
  if (isNaN(val)) return "—";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLF", currencyDisplay: "code", minimumFractionDigits: 2 }).format(val);
}
export function fmtCLP(n?: any) {
  const val = toNumberDisplay(n, { fallback: NaN });
  if (isNaN(val)) return "—";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(val);
}
