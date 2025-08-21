"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { parseFormData, sanitizeText, zClientCreate } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createClient(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") || "/clientes");
  let data: z.infer<typeof zClientCreate>;
  try {
    data = parseFormData(formData, zClientCreate);
  } catch {
    return redirect(`${redirectTo}?error=missing_fields`);
  }
  try {
    const exists = await prisma.client.findUnique({ where: { rut: data.rut } });
    if (exists) return redirect(`${redirectTo}?error=rut_exists`);
    await prisma.client.create({
      data: {
        rut: sanitizeText(data.rut),
        name: sanitizeText(data.name),
        alias: data.alias ? sanitizeText(data.alias) : null,
        email: null,
        phone: null,
        contacts: data.contacts ? sanitizeText(data.contacts) : null,
        notes: data.notes ? sanitizeText(data.notes) : null,
      },
    });
    return redirect(`${redirectTo}?ok=client_created`);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return redirect(`${redirectTo}?error=rut_exists`);
    }
    return redirect(`${redirectTo}?error=unknown`);
  }
}

export async function deleteClientFromForm(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") || "/clientes");
  const id = Number(formData.get("clientId"));
  if (!id) return redirect(redirectTo + "?error=unknown");

  await prisma.$transaction(async (tx) => {
    const proposals = await tx.proposal.findMany({ where: { clientId: id }, select: { id: true } });
    if (proposals.length) {
      await tx.milestone.deleteMany({ where: { proposalId: { in: proposals.map(p => p.id) } } });
      await tx.proposal.deleteMany({ where: { id: { in: proposals.map(p => p.id) } } });
    }
    const procedures = await tx.procedure.findMany({ where: { clientId: id }, select: { id: true } });
    if (procedures.length) {
      const ids = procedures.map(p => p.id);
      await tx.expense.deleteMany({ where: { procedureId: { in: ids } } });
      await tx.todo.deleteMany({ where: { procedureId: { in: ids } } });
      await tx.step.deleteMany({ where: { procedureId: { in: ids } } });
      await tx.waterRight.deleteMany({ where: { procedureId: { in: ids } } });
      await tx.procedure.deleteMany({ where: { id: { in: ids } } });
    }
    await tx.client.delete({ where: { id } });
  });

  revalidatePath("/clientes");
  redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "ok=client_deleted");
}

export async function updateClientFromForm(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") || "/clientes");
  let data: { id: number; rut: string; name: string; alias?: string | null; email?: string | null; phone?: string | null; contacts?: string | null; notes?: string | null; };
  try {
    data = parseFormData(formData, z.object({
      id: z.coerce.number(),
      rut: z.string().trim(),
      name: z.string().trim(),
      alias: z.string().trim().optional().nullable(),
      email: z.string().trim().optional().nullable(),
      phone: z.string().trim().optional().nullable(),
      contacts: z.string().trim().optional().nullable(),
      notes: z.string().trim().optional().nullable(),
    }));
  } catch {
    redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=missing_fields");
    return;
  }

  if (!/^[0-9]{7,8}-[0-9kK]$/.test(data.rut)) {
    redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=rut_invalid");
  }

  try {
    await prisma.client.update({
      where: { id: data.id },
      data: {
        rut: sanitizeText(data.rut),
        name: sanitizeText(data.name),
        alias: data.alias ? sanitizeText(data.alias) : null,
        email: data.email ? sanitizeText(data.email) : null,
        phone: data.phone ? sanitizeText(data.phone) : null,
        contacts: data.contacts ? sanitizeText(data.contacts) : null,
        notes: data.notes ? sanitizeText(data.notes) : null,
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=rut_exists");
    }
    redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=unknown");
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${data.id}`);
  redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "ok=client_updated");
}
