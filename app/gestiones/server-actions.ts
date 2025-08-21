"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Marcado/desmarcado de etapa + comentario opcional
export async function updateStepFromForm(formData: FormData) {
  const stepId = Number(formData.get("stepId"));
  const done = formData.get("done") === "on" || formData.get("done") === "true";
  const comment = (formData.get("comment") as string) || null;
  const doneAtStr = (formData.get("doneAt") as string) || "";
  const milestoneIdStr = (formData.get("milestoneId") as string) || "";

  if (!stepId) return;

  // Si marcan hecho y no hay fecha, usar hoy; si desmarcan, doneAt = null
  const doneAt = done
    ? (doneAtStr ? new Date(doneAtStr) : new Date())
    : null;

  await prisma.step.update({
    where: { id: stepId },
    data: { 
      done, 
      doneAt, 
      comment,
      milestoneId: milestoneIdStr ? Number(milestoneIdStr) : null,
    },
  });

  // Refrescar lastActionAt de la gestión
  const step = await prisma.step.findUnique({
    where: { id: stepId },
    select: { procedureId: true },
  });
  if (step?.procedureId) {
    await prisma.procedure.update({
      where: { id: step.procedureId },
      data: { lastActionAt: new Date() },
    });
  }

  revalidatePath("/gestiones");
}

// Alta de gasto desde lista
export async function addExpenseFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;

  const reason = String(formData.get("reason") || "");
  const documentType = String(formData.get("documentType") || "OTRO");
  const documentNumber = (formData.get("documentNumber") as string) || null;
  const amountUF = Number(formData.get("amountUF") || 0);
  const organism = (formData.get("organism") as string) || null;
  const paidAtStr = (formData.get("paidAt") as string) || "";
  const billedAtStr = (formData.get("billedAt") as string) || "";

  await prisma.expense.create({
    data: {
      procedureId,
      reason,
      documentType,
      documentNumber,
      amountUF,
      organism,
      paidAt: paidAtStr ? new Date(paidAtStr) : null,
      billedAt: billedAtStr ? new Date(billedAtStr) : null,
    },
  });

  await prisma.procedure.update({
    where: { id: procedureId },
    data: { lastActionAt: new Date() },
  });

  revalidatePath("/gestiones");
}

// Alta de ToDo desde lista
export async function addTodoFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;

  const text = String(formData.get("text") || "");
  const dueDateStr = (formData.get("dueDate") as string) || "";

  await prisma.todo.create({
    data: {
      procedureId,
      text,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      done: false,
    },
  });

  await prisma.procedure.update({
    where: { id: procedureId },
    data: { lastActionAt: new Date() },
  });

  revalidatePath("/gestiones");
}

// Agregar derecho de agua
export async function addWaterRightFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;

  const foja = String(formData.get("foja") || "");
  const numero = String(formData.get("numero") || "");
  const anio = Number(formData.get("anio") || 0);
  const cbr = String(formData.get("cbr") || "");
  const naturaleza = String(formData.get("naturaleza") || "SUBTERRANEO");

  await prisma.waterRight.create({
    data: {
      procedureId,
      foja,
      numero,
      anio,
      cbr,
      naturaleza,
    },
  });

  await prisma.procedure.update({
    where: { id: procedureId },
    data: { lastActionAt: new Date() },
  });

  revalidatePath("/gestiones");
}

// Actualizar información general de la gestión
export async function updateProcedureInfoFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;

  const generalInfo = (formData.get("generalInfo") as string) || "";

  await prisma.procedure.update({
    where: { id: procedureId },
    data: { 
      generalInfo,
      lastActionAt: new Date() 
    },
  });

  revalidatePath("/gestiones");
}

// Actualizar estado de la gestión
export async function updateProcedureStatusFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;

  const status = String(formData.get("status") || "");

  await prisma.procedure.update({
    where: { id: procedureId },
    data: { 
      status,
      lastActionAt: new Date() 
    },
  });

  revalidatePath("/gestiones");
}

// Actualizar To-Do
export async function updateTodoFromForm(formData: FormData) {
  const todoId = Number(formData.get("todoId"));
  const text = String(formData.get("text") || "");
  const done = formData.get("done") === "on" || formData.get("done") === "true";
  const dueDateStr = (formData.get("dueDate") as string) || "";
  if (!todoId) return;
  await prisma.todo.update({
    where: { id: todoId },
    data: {
      text,
      done,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
    },
  });
  const t = await prisma.todo.findUnique({ where: { id: todoId }, select: { procedureId: true }});
  if (t?.procedureId) {
    await prisma.procedure.update({ where: { id: t.procedureId }, data: { lastActionAt: new Date() }});
  }
  revalidatePath("/gestiones");
}

// Eliminar To-Do
export async function deleteTodoFromForm(formData: FormData) {
  const todoId = Number(formData.get("todoId"));
  const redirectTo = String(formData.get("redirectTo") || "/gestiones");
  if (!todoId) return;
  const t = await prisma.todo.findUnique({ where: { id: todoId }, select: { procedureId: true }});
  await prisma.todo.delete({ where: { id: todoId }});
  if (t?.procedureId) {
    await prisma.procedure.update({ where: { id: t.procedureId }, data: { lastActionAt: new Date() }});
  }
  revalidatePath("/gestiones");
  // No redirect for inline update; keep path.
}

// Actualizar meta de la gestión (estado + tags)
export async function updateProcedureMetaFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const status = String(formData.get("status") || "").trim(); // "PENDING" | "IN_PROGRESS" | "DONE"
  const tags = formData.getAll("tags[]").map(v => String(v)).filter(Boolean);
  if (!procedureId) return;

  const proc = await prisma.procedure.findUnique({ where: { id: procedureId }, select: { generalInfo: true }});
  const { setTagsInGeneralInfo } = await import("@/lib/tags");
  const newInfo = setTagsInGeneralInfo(proc?.generalInfo, tags);

  await prisma.procedure.update({
    where: { id: procedureId },
    data: {
      status: status || undefined,
      generalInfo: newInfo,
      lastActionAt: new Date(),
    },
  });
  revalidatePath("/gestiones");
}
