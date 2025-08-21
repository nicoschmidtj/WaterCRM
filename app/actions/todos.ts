"use server";

import { prisma } from "@/lib/prisma";
import { parseFormData, sanitizeText, zTodo } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function addTodoFromForm(formData: FormData) {
  let data: any;
  try {
    data = parseFormData(formData, zTodo);
  } catch {
    return;
  }
  const { procedureId, text, dueDate } = data;
  await prisma.todo.create({
    data: {
      procedureId,
      text: sanitizeText(text),
      dueDate: dueDate ? new Date(dueDate) : null,
      done: false,
    },
  });
  await prisma.procedure.update({ where: { id: procedureId }, data: { lastActionAt: new Date() } });
  revalidatePath("/gestiones");
}

export async function updateTodoFromForm(formData: FormData) {
  let data: any;
  try {
    data = parseFormData(formData, z.object({
      todoId: z.coerce.number(),
      text: z.string().trim().optional(),
      done: z.coerce.boolean().optional(),
      dueDate: z.string().optional(),
    }));
  } catch {
    return;
  }
  const { todoId, text, done, dueDate } = data;
  await prisma.todo.update({
    where: { id: todoId },
    data: {
      text: text ? sanitizeText(text) : undefined,
      done: !!done,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  const t = await prisma.todo.findUnique({ where: { id: todoId }, select: { procedureId: true } });
  if (t?.procedureId) {
    await prisma.procedure.update({ where: { id: t.procedureId }, data: { lastActionAt: new Date() } });
  }
  revalidatePath("/gestiones");
}

export async function deleteTodoFromForm(formData: FormData) {
  const todoId = Number(formData.get("todoId"));
  const redirectTo = String(formData.get("redirectTo") || "/gestiones");
  if (!todoId) return;
  const t = await prisma.todo.findUnique({ where: { id: todoId }, select: { procedureId: true } });
  await prisma.todo.delete({ where: { id: todoId } });
  if (t?.procedureId) {
    await prisma.procedure.update({ where: { id: t.procedureId }, data: { lastActionAt: new Date() } });
  }
  revalidatePath("/gestiones");
}
