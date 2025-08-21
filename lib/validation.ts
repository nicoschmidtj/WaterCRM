import { z } from "zod";

export const zClientCreate = z.object({
  rut: z.string().trim().min(1),
  name: z.string().trim().min(1),
  alias: z.string().trim().optional().nullable(),
  contacts: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  redirectTo: z.string().trim().optional(),
});

export const zProcedureCreate = z.object({
  clientId: z.coerce.number(),
  type: z.string().trim().min(1),
  title: z.string().trim().optional().nullable(),
  region: z.string().trim().optional().nullable(),
  province: z.string().trim().optional().nullable(),
  generalInfo: z.string().trim().optional().nullable(),
  proposalId: z.coerce.number().optional().nullable(),
  redirectTo: z.string().trim().optional(),
  mode: z.string().optional(),
  templateKey: z.string().optional(),
  includeGroups: z.string().optional(),
  customSteps: z.string().optional(),
  "wr[data]": z.string().optional(),
});

export const zProposal = z.object({
  id: z.coerce.number().optional(),
  clientId: z.coerce.number(),
  title: z.string().trim().min(1),
  feeUF: z.coerce.number().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  redirectTo: z.string().trim().optional(),
});

export const zMilestone = z.object({
  proposalId: z.coerce.number(),
  title: z.string().trim().min(1),
  triggeredAt: z.string().optional(),
  isTriggered: z.coerce.boolean().optional(),
});

export const zExpense = z.object({
  procedureId: z.coerce.number(),
  reason: z.string().trim().min(1),
  documentType: z.string().trim().min(1),
  documentNumber: z.string().trim().optional().nullable(),
  amountUF: z.coerce.number(),
  organism: z.string().trim().optional().nullable(),
  paidAt: z.string().optional(),
  billedAt: z.string().optional(),
});

export const zTodo = z.object({
  procedureId: z.coerce.number(),
  text: z.string().trim().min(1),
  dueDate: z.string().optional(),
  done: z.coerce.boolean().optional(),
  todoId: z.coerce.number().optional(),
});

export const StepUpdateSchema = z.object({
  stepId: z.coerce.number().int().positive(),
  done: z.coerce.boolean(),
  doneAt: z
    .string()
    .datetime()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  comment: z.string().trim().max(2000).optional(),
});

export const zFilters = z.object({
  client: z.coerce.number().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  region: z.string().optional(),
  province: z.string().optional(),
  order: z.string().optional(),
  tagDelegable: z.coerce.boolean().optional(),
  tagPrioridad: z.coerce.boolean().optional(),
  category: z.string().optional(),
  id: z.coerce.number().optional(),
  pid: z.coerce.number().optional(),
});

export function parseFormData<T>(fd: FormData, schema: z.ZodType<T>): T {
  const obj: Record<string, any> = {};
  fd.forEach((v, k) => {
    obj[k] = typeof v === "string" ? v : v.toString();
  });
  const res = schema.safeParse(obj);
  if (!res.success) throw res.error;
  return res.data;
}

export function sanitizeText(s: string): string {
  return s.replace(/<script.*?>.*?<\/script>/gi, "").replace(/\s+/g, " ").trim();
}
