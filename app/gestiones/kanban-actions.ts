"use server";

import { prisma } from "@/lib/prisma";
import { inferStageSetFromTemplate } from "@/lib/stages";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const moveToStatusSchema = z.object({
  procedureId: z.number(),
  toStatus: z.enum(["PENDING", "IN_PROGRESS", "DONE"]),
});

export async function moveToStatus(input: z.infer<typeof moveToStatusSchema>) {
  const data = moveToStatusSchema.parse(input);
  await prisma.procedure.update({
    where: { id: data.procedureId },
    data: {
      status: data.toStatus,
      lastActionAt: new Date(),
      ...(data.toStatus === "DONE" ? { doneAt: new Date() } : {}),
    } as any,
  });
  revalidatePath("/gestiones");
}

const moveToStageSchema = z.object({
  procedureId: z.number(),
  typeKey: z.string(),
  toStageKey: z.string(),
  strict: z.boolean().optional().default(false),
});

export async function moveToStage(input: z.infer<typeof moveToStageSchema>) {
  const { procedureId, typeKey, toStageKey, strict } = moveToStageSchema.parse(input);
  const set = inferStageSetFromTemplate(typeKey);
  const targetIdx = set.findIndex((s) => s.key === toStageKey);
  if (targetIdx === -1) return;
  const proc = await prisma.procedure.findUnique({
    where: { id: procedureId },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!proc) return;
  const today = new Date();
  const updates = proc.steps.map((s) => {
    const idx = proc.steps.indexOf(s);
    if (idx <= targetIdx) {
      if (!s.done)
        return prisma.step.update({
          where: { id: s.id },
          data: { done: true, doneAt: today },
        });
    } else if (strict && s.done) {
      return prisma.step.update({
        where: { id: s.id },
        data: { done: false, doneAt: null },
      });
    }
    return null;
  }).filter(Boolean) as any[];
  if (updates.length) await prisma.$transaction(updates);
  await prisma.procedure.update({
    where: { id: procedureId },
    data: { lastActionAt: today },
  });
  revalidatePath("/gestiones");
}

const toggleTagSchema = z.object({
  procedureId: z.number(),
  tag: z.enum(["#Delegable", "#Prioridad"]),
});

export async function toggleTag(input: z.infer<typeof toggleTagSchema>) {
  const { procedureId, tag } = toggleTagSchema.parse(input);
  const proc = await prisma.procedure.findUnique({ where: { id: procedureId }, select: { generalInfo: true } });
  if (!proc) return;
  let info = proc.generalInfo || "";
  const tagMatch = info.match(/\n\n\[TAGS\]: (.*)$/);
  let tags: string[] = [];
  if (tagMatch) {
    tags = tagMatch[1].trim().split(/\s+/).filter(Boolean);
    info = info.replace(/\n\n\[TAGS\]: .*$/, "");
  }
  if (tags.includes(tag)) tags = tags.filter((t) => t !== tag);
  else tags.push(tag);
  const tagLine = tags.length ? `\n\n[TAGS]: ${tags.join(" ")}` : "";
  await prisma.procedure.update({
    where: { id: procedureId },
    data: { generalInfo: info + tagLine, lastActionAt: new Date() },
  });
  revalidatePath("/gestiones");
}
