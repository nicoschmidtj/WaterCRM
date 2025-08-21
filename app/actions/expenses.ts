"use server";

import { prisma } from "@/lib/prisma";
import { parseFormData, sanitizeText, zExpense } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function addExpenseFromForm(formData: FormData) {
  let data: any;
  try {
    data = parseFormData(formData, zExpense);
  } catch {
    return;
  }
  const { procedureId, reason, documentType, documentNumber, amountUF, organism, paidAt, billedAt } = data;
  await prisma.expense.create({
    data: {
      procedureId,
      reason: sanitizeText(reason),
      documentType: sanitizeText(documentType),
      documentNumber: documentNumber ? sanitizeText(documentNumber) : null,
      amountUF,
      organism: organism ? sanitizeText(organism) : null,
      paidAt: paidAt ? new Date(paidAt) : null,
      billedAt: billedAt ? new Date(billedAt) : null,
    },
  });
  await prisma.procedure.update({ where: { id: procedureId }, data: { lastActionAt: new Date() } });
  revalidatePath("/gestiones");
}
