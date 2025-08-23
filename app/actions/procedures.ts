"use server";

import { prisma } from "@/lib/prisma";
import { parseFormData, sanitizeText, zProcedureCreate, StepUpdateSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { TEMPLATES_BY_KEY, flattenTemplate } from "@/lib/procedureRepo";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createProcedure(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") || "/gestiones");
  let data: z.infer<typeof zProcedureCreate>;
  try {
    data = parseFormData(formData, zProcedureCreate);
  } catch {
    return redirect(`${redirectTo}?error=missing_fields`);
  }

  const { clientId, type, title, region, province, generalInfo, proposalId, mode, templateKey, includeGroups, customSteps } = data;
  if (!clientId || !type) return redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=missing_fields`);

  let waterRights: Array<{ naturaleza: string; foja: string; numero: string; anio: number; cbr: string }> = [];
  if (data["wr[data]"]) {
    try { waterRights = JSON.parse(data["wr[data]"] as string) || []; } catch { waterRights = []; }
  }

  let stepTitles: string[] = [];
  let typeValue = "";
  if (mode === "repo" && templateKey) {
    const include = includeGroups ? JSON.parse(includeGroups) : [];
    const spec = TEMPLATES_BY_KEY[templateKey];
    if (!spec) throw new Error("Template no encontrada");
    stepTitles = flattenTemplate(spec, { includeGroups: include });
    typeValue = spec.key;
  } else {
    const arr = customSteps ? JSON.parse(customSteps) : [];
    stepTitles = Array.isArray(arr) ? arr.filter(Boolean) : [];
    if (stepTitles.length === 0) stepTitles = ["Definir etapas"];
    typeValue = type || "CUSTOM";
  }

  const procedure = await prisma.procedure.create({
    data: {
      clientId,
      type: typeValue,
      title: title ? sanitizeText(title) : null,
      region: region ? sanitizeText(region) : null,
      province: province ? sanitizeText(province) : null,
      generalInfo: generalInfo ? sanitizeText(generalInfo) : null,
      proposalId: proposalId ?? null,
      status: "PENDING",
      steps: { create: stepTitles.map((t, idx) => ({ order: idx + 1, title: sanitizeText(t) })) },
    },
  });

  if (waterRights.length > 0) {
    await prisma.waterRight.createMany({
      data: waterRights
        .filter((w) => w.foja && w.numero && w.anio && w.cbr)
        .map((w) => ({
          procedureId: procedure.id,
          naturaleza: w.naturaleza || "SUBTERRANEO",
          foja: sanitizeText(w.foja),
          numero: sanitizeText(w.numero),
          anio: Number(w.anio),
          cbr: sanitizeText(w.cbr),
        })),
    });
  }

  return redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}ok=procedure_created`);
}

export async function createClientAndProcedure(formData: FormData) {
  const clientIdRaw = String(formData.get("clientId") || "");
  const type = String(formData.get("type"));
  const title = String(formData.get("title") || "");
  const region = String(formData.get("region") || "");
  const province = String(formData.get("province") || "");
  const generalInfoRaw = String(formData.get("generalInfo") || "");
  const wrJson = String(formData.get("wr[data]") || "");
  const redirectTo = String(formData.get("redirectTo") || "/gestiones");
  const doCreateClient = !clientIdRaw;

  const mode = String(formData.get("mode") || "repo");
  const templateKey = String(formData.get("templateKey") || "");
  const includeGroupsJson = String(formData.get("includeGroups") || "[]");
  const customStepsJson = String(formData.get("customSteps") || "[]");

  const tagsArray = formData.getAll("tags[]").map(v => String(v)).filter(Boolean);
  const tagsLine = tagsArray.length ? `Tags: ${tagsArray.join(" ")}` : "";
  const generalInfo = [generalInfoRaw, tagsLine].filter(Boolean).join("\n");

  try {
    await prisma.$transaction(async (tx) => {
      let clientId = clientIdRaw ? Number(clientIdRaw) : 0;
      if (doCreateClient) {
        const rut = sanitizeText(String(formData.get("rut") || ""));
        const name = sanitizeText(String(formData.get("name") || ""));
        const alias = sanitizeText(String(formData.get("alias") || ""));
        const email = sanitizeText(String(formData.get("email") || ""));
        const phone = sanitizeText(String(formData.get("phone") || ""));
        const contacts = sanitizeText(String(formData.get("contacts") || ""));
        if (!rut || !name) return redirect(`${redirectTo}?error=missing_fields`);
        const exists = await tx.client.findUnique({ where: { rut } });
        if (exists) return redirect(`${redirectTo}?error=rut_exists`);
        const c = await tx.client.create({ data: { rut, name, alias: alias || null, email: email || null, phone: phone || null, contacts: contacts || null } });
        clientId = c.id;
      }

      let stepTitles: string[] = [];
      let typeValue: string = "";

      if (mode === "repo" && templateKey) {
        const includeGroups = JSON.parse(includeGroupsJson || "[]");
        const spec = TEMPLATES_BY_KEY[templateKey];
        if (!spec) throw new Error("Template no encontrada");
        stepTitles = flattenTemplate(spec, { includeGroups });
        typeValue = spec.key;
      } else {
        const arr = JSON.parse(customStepsJson || "[]");
        stepTitles = Array.isArray(arr) ? arr.filter(Boolean) : [];
        if (stepTitles.length === 0) stepTitles = ["Definir etapas"];
        typeValue = String(formData.get("type") || "CUSTOM");
      }

      const procedure = await tx.procedure.create({
        data: {
          clientId,
          type: typeValue,
          title: title || null,
          region: region || null,
          province: province || null,
          generalInfo: generalInfo || null,
          status: "PENDING",
          steps: { create: stepTitles.map((t, idx) => ({
            order: idx + 1,
            title: sanitizeText(t),
            done: false,
          })) },
        },
      });

      if (wrJson) {
        try {
          const waterRights = JSON.parse(wrJson) as Array<{ naturaleza: string; foja: string; numero: string; anio: number; cbr: string }>;
          if (waterRights?.length) {
            await tx.waterRight.createMany({
              data: waterRights.filter(w => w.foja && w.numero && w.anio && w.cbr).map(w => ({
                procedureId: procedure.id,
                naturaleza: w.naturaleza || "SUBTERRANEO",
                foja: sanitizeText(w.foja),
                numero: sanitizeText(w.numero),
                anio: Number(w.anio),
                cbr: sanitizeText(w.cbr),
              }))
            });
          }
        } catch {}
      }
      await tx.procedure.update({ where: { id: procedure.id }, data: { lastActionAt: new Date() } });
    });
    return redirect(`${redirectTo}?ok=client_and_procedure_created`);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return redirect(`${redirectTo}?error=rut_exists`);
    return redirect(`${redirectTo}?error=unknown`);
  }
}

export async function deleteProcedureFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const redirectTo = String(formData.get("redirectTo") || "/gestiones");
  if (!procedureId) redirect(redirectTo + "?error=unknown");

  await prisma.$transaction(async (tx) => {
    await tx.expense.deleteMany({ where: { procedureId } });
    await tx.todo.deleteMany({ where: { procedureId } });
    await tx.step.deleteMany({ where: { procedureId } });
    await tx.waterRight.deleteMany({ where: { procedureId } });
    await tx.procedure.update({ where: { id: procedureId }, data: { proposalId: null } });
    await tx.procedure.delete({ where: { id: procedureId } });
  });

  revalidatePath("/gestiones");
  redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "ok=procedure_deleted");
}

export async function updateStepFromForm(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") || "/gestiones");
  let data: z.infer<typeof StepUpdateSchema>;
  try {
    data = parseFormData(formData, StepUpdateSchema);
  } catch {
    return redirect(`${redirectTo}?error=invalid_step`);
  }

  const { stepId, done, doneAt, comment } = data;
  const milestoneIdStr = String(formData.get("milestoneId") || "");
  const doneAtDate = done ? (doneAt ? new Date(doneAt) : new Date()) : null;

  await prisma.step.update({
    where: { id: stepId },
    data: {
      done,
      doneAt: doneAtDate,
      comment: comment ? sanitizeText(comment) : null,
      milestoneId: milestoneIdStr ? Number(milestoneIdStr) : null,
    },
  });
  const step = await prisma.step.findUnique({ where: { id: stepId }, select: { procedureId: true } });
  if (step?.procedureId) {
    await prisma.procedure.update({ where: { id: step.procedureId }, data: { lastActionAt: new Date() } });
  }
  revalidatePath("/gestiones");
}

export async function addWaterRightFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;
  const foja = sanitizeText(String(formData.get("foja") || ""));
  const numero = sanitizeText(String(formData.get("numero") || ""));
  const anio = Number(formData.get("anio") || 0);
  const cbr = sanitizeText(String(formData.get("cbr") || ""));
  const naturaleza = sanitizeText(String(formData.get("naturaleza") || "SUBTERRANEO"));
  await prisma.waterRight.create({
    data: { procedureId, foja, numero, anio, cbr, naturaleza },
  });
  await prisma.procedure.update({ where: { id: procedureId }, data: { lastActionAt: new Date() } });
  revalidatePath("/gestiones");
}

export async function updateProcedureInfoFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;
  const generalInfo = sanitizeText(String(formData.get("generalInfo") || ""));
  await prisma.procedure.update({
    where: { id: procedureId },
    data: { generalInfo, lastActionAt: new Date() },
  });
  revalidatePath("/gestiones");
}

export async function updateProcedureStatusFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  if (!procedureId) return;
  const status = sanitizeText(String(formData.get("status") || ""));
  await prisma.procedure.update({
    where: { id: procedureId },
    data: { status, lastActionAt: new Date() },
  });
  revalidatePath("/gestiones");
}

export async function updateProcedureMetaFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const status = sanitizeText(String(formData.get("status") || ""));
  const tags = formData.getAll("tags[]").map((v) => sanitizeText(String(v))).filter(Boolean);
  if (!procedureId) return;
  const proc = await prisma.procedure.findUnique({ where: { id: procedureId }, select: { generalInfo: true } });
  const { setTagsInGeneralInfo } = await import("@/lib/tags");
  const newInfo = setTagsInGeneralInfo(proc?.generalInfo, tags);
  await prisma.procedure.update({
    where: { id: procedureId },
    data: { status: status || undefined, generalInfo: newInfo, lastActionAt: new Date() },
  });
  revalidatePath("/gestiones");
}


