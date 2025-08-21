"use server";

import { prisma } from "@/lib/prisma";
import { parseFormData, sanitizeText } from "@/lib/validation";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createProposal(formData: FormData) {
  const fallback = String(formData.get("redirectTo") || "/clientes");
  let data: any;
  try {
    data = parseFormData(formData, z.object({
      clientId: z.coerce.number(),
      title: z.string().trim(),
      description: z.string().trim().optional().nullable(),
      billingMode: z.string().trim().optional(),
      totalFeeUF: z.coerce.number().optional().nullable(),
      redirectTo: z.string().trim().optional(),
    }));
  } catch {
    return redirect(`${fallback}?error=missing_fields`);
  }
  const { clientId, title, description, billingMode = "HITOS", totalFeeUF, redirectTo } = data;
  const dest = redirectTo || `/clientes/${clientId}?tab=facturacion`;
  try {
    await prisma.proposal.create({
      data: { clientId, title: sanitizeText(title), description: description ? sanitizeText(description) : null, billingMode, totalFeeUF },
    });
    return redirect(`${dest}?ok=proposal_created`);
  } catch {
    return redirect(`${dest}?error=unknown`);
  }
}

export async function updateProposal(formData: FormData) {
  let data: any;
  try {
    data = parseFormData(formData, z.object({
      proposalId: z.coerce.number(),
      title: z.string().trim(),
      description: z.string().trim().optional().nullable(),
      billingMode: z.string().trim().optional(),
      totalFeeUF: z.coerce.number().optional().nullable(),
    }));
  } catch {
    throw new Error("ID y título requeridos.");
  }
  const { proposalId, title, description, billingMode = "HITOS", totalFeeUF } = data;
  return prisma.proposal.update({
    where: { id: proposalId },
    data: { title: sanitizeText(title), description: description ? sanitizeText(description) : null, billingMode, totalFeeUF },
  });
}

export async function deleteProposal(formData: FormData) {
  const data = parseFormData(formData, z.object({ proposalId: z.coerce.number() }));
  const proposalId = data.proposalId;
  const milestones = await prisma.milestone.findMany({ where: { proposalId }, select: { id: true } });
  const ids = milestones.map((m) => m.id);
  if (ids.length > 0) {
    await prisma.step.updateMany({ where: { milestoneId: { in: ids } }, data: { milestoneId: null } });
    await prisma.milestone.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.proposal.delete({ where: { id: proposalId } });
}
