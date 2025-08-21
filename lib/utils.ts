export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
export function fmtUF(n?: number | string | null) {
  if (n == null) return "—";
  const val = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLF", currencyDisplay: "code", minimumFractionDigits: 2 }).format(val);
}
export function fmtCLP(n?: number | string | null) {
  if (n == null) return "—";
  const val = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(val);
}
