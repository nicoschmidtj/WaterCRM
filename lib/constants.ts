export const STATUS = ["PENDING", "IN_PROGRESS", "DONE"] as const;
export type Status = typeof STATUS[number];

export const PROCEDURE_TYPES = [
  // 8 administrativos
  "ADM_SOLICITUD",
  "ADM_REGULARIZACION",
  "ADM_PERFECCIONAMIENTO",
  "ADM_INSCRIPCION",
  "ADM_MEDICION",
  "ADM_MODIFICACION",
  "ADM_TRASLADO",
  "ADM_OTROS",
  // 4 judiciales
  "JUD_DEMANDA",
  "JUD_RECURSO",
  "JUD_APELACION",
  "JUD_CUMPLIMIENTO",
  // 1 informe
  "INF_TECNICO",
  // 2 corretaje
  "COR_COMPRA",
  "COR_VENTA",
  // 1 otros
  "OTROS",
] as const;
export type ProcedureType = typeof PROCEDURE_TYPES[number];

export const BILLING_MODES = ["HITOS", "HORA", "MIXTO"] as const;
export type BillingMode = typeof BILLING_MODES[number];

export const NATURALEZA = ["SUBTERRANEO", "SUPERFICIAL"] as const;
export const DOCTYPES = ["BOLETA", "FACTURA", "OTRO"] as const;

export type Contact = { nombre: string; correo?: string; telefono?: string };