"use server";

import { prisma } from "@/lib/prisma";
import { parseFormData, sanitizeText } from "@/lib/validation";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export async function createMilestone(formData: FormData) {
  const fallback = String(formData.get("redirectTo") || "/clientes");
  let data: any;
  try {
    data = parseFormData(formData, z.object({
      proposalId: z.coerce.number(),
      title: z.string().trim(),
      feeUF: z.coerce.number().optional().nullable(),
      dueDate: z.string().optional(),
      note: z.string().trim().optional().nullable(),
      clientId: z.coerce.number().optional(),
      redirectTo: z.string().trim().optional(),
    }));
  } catch {
    return redirect(`${fallback}?error=missing_fields`);
  }
  const { proposalId, title, feeUF, dueDate, note, clientId, redirectTo } = data;
  const dest = redirectTo || `/clientes/${clientId}?tab=facturacion`;
  try {
    await prisma.milestone.create({
      data: {
        proposalId,
        title: sanitizeText(title),
        feeUF: (feeUF as unknown as Prisma.Decimal) ?? undefined,
        dueDate: dueDate ? new Date(dueDate) : null,
        note: note ? sanitizeText(note) : null,
      },
    });
    return redirect(`${dest}?ok=milestone_created`);
  } catch {
    return redirect(`${dest}?error=unknown`);
  }
}

export async function updateMilestone(formData: FormData) {
  let data: any;
  try {
    data = parseFormData(formData, z.object({
      milestoneId: z.coerce.number(),
      title: z.string().trim(),
      feeUF: z.coerce.number().optional().nullable(),
      dueDate: z.string().optional(),
      isTriggered: z.coerce.boolean().optional(),
      triggeredAt: z.string().optional(),
      note: z.string().trim().optional().nullable(),
    }));
  } catch {
    throw new Error("ID y título requeridos.");
  }
  const { milestoneId, title, feeUF, dueDate, isTriggered, triggeredAt, note } = data;
  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      title: sanitizeText(title),
      feeUF: (feeUF as unknown as Prisma.Decimal) ?? undefined,
      dueDate: dueDate ? new Date(dueDate) : null,
      isTriggered,
      triggeredAt: isTriggered ? (triggeredAt ? new Date(triggeredAt) : new Date()) : null,
      note: note ? sanitizeText(note) : null,
    },
  });
}

export async function deleteMilestone(formData: FormData) {
  const data = parseFormData(formData, z.object({ milestoneId: z.coerce.number() }));
  const milestoneId = data.milestoneId;
  await prisma.step.updateMany({ where: { milestoneId }, data: { milestoneId: null } });
  await prisma.milestone.delete({ where: { id: milestoneId } });
}
