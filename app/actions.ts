"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { templates } from "@/lib/procedureTemplates";
import { TEMPLATES_BY_KEY, flattenTemplate } from "@/lib/procedureRepo";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function createClient(formData: FormData) {
  const rut = String(formData.get("rut") || "");
  const name = String(formData.get("name") || "");
  const alias = String(formData.get("alias") || "");
  const contacts = String(formData.get("contacts") || "");
  const notes = String(formData.get("notes") || "");
  const redirectTo = String(formData.get("redirectTo") || "/clientes");
  if (!rut || !name) return redirect(`${redirectTo}?error=missing_fields`);
  try {
    const exists = await prisma.client.findUnique({ where: { rut } });
    if (exists) return redirect(`${redirectTo}?error=rut_exists`);
    await prisma.client.create({
      data: {
        rut,
        name,
        alias: alias || null,
        email: null, // Ya no se usa
        phone: null, // Ya no se usa
        contacts: contacts || null,
        notes: notes || null,
      }
    });
    return redirect(`${redirectTo}?ok=client_created`);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return redirect(`${redirectTo}?error=rut_exists`);
    return redirect(`${redirectTo}?error=unknown`);
  }
}
export async function createProcedure(formData: FormData) {
  const clientId = Number(formData.get("clientId"));
  const type = String(formData.get("type"));
  const title = String(formData.get("title") || "");
  const region = String(formData.get("region") || "");
  const province = String(formData.get("province") || "");
  const generalInfo = String(formData.get("generalInfo") || "");
  const proposalIdRaw = String(formData.get("proposalId") || "");
  const proposalId = proposalIdRaw ? Number(proposalIdRaw) : null;
  const redirectTo = String(formData.get("redirectTo") || (clientId ? `/clientes/${clientId}?tab=gestiones` : "/gestiones"));
  const wrJson = String(formData.get("wr[data]") || "");
  
  // Nuevos campos para plantillas
  const mode = String(formData.get("mode") || "repo"); // "repo" | "custom"
  const templateKey = String(formData.get("templateKey") || "");
  const includeGroupsJson = String(formData.get("includeGroups") || "[]");
  const customStepsJson = String(formData.get("customSteps") || "[]");
  
  let waterRights: Array<{ naturaleza: string; foja: string; numero: string; anio: number; cbr: string }> = [];
  if (wrJson) {
    try { waterRights = JSON.parse(wrJson) || []; } catch { waterRights = []; }
  }
  
  if (!clientId || !type) return redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=missing_fields`);
  
  // Resolver stepTitles y typeValue
  let stepTitles: string[] = [];
  let typeValue: string = "";
  
  if (mode === "repo" && templateKey) {
    const includeGroups = JSON.parse(includeGroupsJson || "[]");
    const spec = TEMPLATES_BY_KEY[templateKey];
    if (!spec) throw new Error("Template no encontrada");
    stepTitles = flattenTemplate(spec, { includeGroups });
    typeValue = spec.key; // usamos key estable (ADM_*, JUD_*, etc.)
  } else {
    const arr = JSON.parse(customStepsJson || "[]");
    stepTitles = Array.isArray(arr) ? arr.filter(Boolean) : [];
    if (stepTitles.length === 0) stepTitles = ["Definir etapas"];
    typeValue = String(formData.get("type") || "CUSTOM");
  }
  
  const procedure = await prisma.procedure.create({
    data: {
      clientId, 
      type: typeValue, 
      title: title || null, 
      region: region || null, 
      province: province || null, 
      generalInfo: generalInfo || null, 
      proposalId,
      status: "PENDING",
      steps: { create: stepTitles.map((t, idx) => ({ order: idx + 1, title: t })) }
    }
  });
  
  if (waterRights.length > 0) {
    await prisma.waterRight.createMany({
      data: waterRights.filter(w => w.foja && w.numero && w.anio && w.cbr).map(w => ({
        procedureId: procedure.id,
        naturaleza: w.naturaleza || "SUBTERRANEO",
        foja: w.foja,
        numero: w.numero,
        anio: Number(w.anio),
        cbr: w.cbr,
      }))
    });
  }
  
  return redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}ok=procedure_created`);
}
export async function updateStep({ stepId, done, comment, doneAt, milestoneId }: { stepId: number, done: boolean, comment?: string, doneAt?: string, milestoneId?: number | null }) {
  const step = await prisma.step.findUnique({ where: { id: stepId }, select: { procedureId: true, milestoneId: true } });
  const newDoneAt = done ? (doneAt ? new Date(doneAt) : new Date()) : null;
  const updated = await prisma.step.update({
    where: { id: stepId },
    data: { done, comment: comment ?? null, doneAt: newDoneAt, milestoneId: typeof milestoneId === "number" ? milestoneId : milestoneId === null ? null : step?.milestoneId || null }
  });
  // Si marcamos como hecho y hay milestone vinculado, gatillar milestone
  const effectiveMilestoneId = typeof milestoneId === "number" ? milestoneId : step?.milestoneId || null;
  if (done && effectiveMilestoneId) {
    const ms = await prisma.milestone.findUnique({ where: { id: effectiveMilestoneId }, select: { isTriggered: true } });
    if (ms && !ms.isTriggered) {
      await prisma.milestone.update({ where: { id: effectiveMilestoneId }, data: { isTriggered: true, triggeredAt: newDoneAt ?? new Date() } });
    }
  }
  if (step?.procedureId) {
    await prisma.procedure.update({ where: { id: step.procedureId }, data: { lastActionAt: new Date() } });
  }
  return updated;
}
export async function addWaterRight(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const foja = String(formData.get("foja") || "");
  const numero = String(formData.get("numero") || "");
  const anio = Number(formData.get("anio"));
  const cbr = String(formData.get("cbr") || "");
  const naturaleza = String(formData.get("naturaleza") || "SUBTERRANEO");
  if (!procedureId || !foja || !numero || !anio || !cbr) throw new Error("Datos de derecho incompletos.");
  return prisma.waterRight.create({ data: { procedureId, foja, numero, anio, cbr, naturaleza } });
}
export async function addTodo(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const text = String(formData.get("text") || "");
  const dueDate = String(formData.get("dueDate") || "");
  if (!procedureId || !text) throw new Error("To-do incompleto.");
  const todo = await prisma.todo.create({ data: { procedureId, text, dueDate: dueDate ? new Date(dueDate) : null } });
  await prisma.procedure.update({ where: { id: procedureId }, data: { lastActionAt: new Date() } });
  return todo;
}
export async function addExpense(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const reason = String(formData.get("reason") || "");
  const documentType = String(formData.get("documentType") || "OTRO");
  const documentNumber = String(formData.get("documentNumber") || "");
  const amountUF = Number(formData.get("amountUF"));
  const organism = String(formData.get("organism") || "");
  const paidAt = String(formData.get("paidAt") || "");
  const billedAt = String(formData.get("billedAt") || "");
  if (!procedureId || !reason || !amountUF) throw new Error("Gasto incompleto.");
  const expense = await prisma.expense.create({
    data: {
      procedureId, reason, documentType, documentNumber: documentNumber || null,
      amountUF: amountUF as unknown as Prisma.Decimal, organism: organism || null, paidAt: paidAt ? new Date(paidAt) : null, billedAt: billedAt ? new Date(billedAt) : null
    }
  });
  await prisma.procedure.update({ where: { id: procedureId }, data: { lastActionAt: new Date() } });
  return expense;
}

export async function updateProcedureStatus(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const status = String(formData.get("status"));
  if (!procedureId || !status) throw new Error("Datos incompletos.");
  return prisma.procedure.update({ where: { id: procedureId }, data: { status, lastActionAt: new Date() } });
}

export async function updateProcedureInfo(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const generalInfo = String(formData.get("generalInfo") || "");
  if (!procedureId) throw new Error("ID de gestión requerido.");
  return prisma.procedure.update({ where: { id: procedureId }, data: { generalInfo: generalInfo || null, lastActionAt: new Date() } });
}

// Proposals CRUD
export async function createProposal(formData: FormData) {
  const clientId = Number(formData.get("clientId"));
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const billingMode = String(formData.get("billingMode") || "HITOS");
  const totalFeeUFRaw = String(formData.get("totalFeeUF") || "");
  const totalFeeUF = totalFeeUFRaw ? Number(totalFeeUFRaw) : null;
  const redirectTo = String(formData.get("redirectTo") || `/clientes/${clientId}?tab=facturacion`);
  if (!clientId || !title) return redirect(`${redirectTo}?error=missing_fields`);
  try {
    await prisma.proposal.create({ data: { clientId, title, description: description || null, billingMode, totalFeeUF } });
    return redirect(`${redirectTo}?ok=proposal_created`);
  } catch {
    return redirect(`${redirectTo}?error=unknown`);
  }
}

export async function updateProposal(formData: FormData) {
  const proposalId = Number(formData.get("proposalId"));
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const billingMode = String(formData.get("billingMode") || "HITOS");
  const totalFeeUFRaw = String(formData.get("totalFeeUF") || "");
  const totalFeeUF = totalFeeUFRaw ? Number(totalFeeUFRaw) : null;
  if (!proposalId || !title) throw new Error("ID y título requeridos.");
  return prisma.proposal.update({ where: { id: proposalId }, data: { title, description: description || null, billingMode, totalFeeUF } });
}

export async function deleteProposal(formData: FormData) {
  const proposalId = Number(formData.get("proposalId"));
  if (!proposalId) throw new Error("ID de propuesta requerido.");
  const milestones = await prisma.milestone.findMany({ where: { proposalId }, select: { id: true } });
  const ids = milestones.map(m => m.id);
  if (ids.length > 0) {
    await prisma.step.updateMany({ where: { milestoneId: { in: ids } }, data: { milestoneId: null } });
    await prisma.milestone.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.proposal.delete({ where: { id: proposalId } });
}

// Milestones CRUD
export async function createMilestone(formData: FormData) {
  const proposalId = Number(formData.get("proposalId"));
  const title = String(formData.get("title") || "");
  const feeUFRaw = String(formData.get("feeUF") || "");
  const feeUF = feeUFRaw ? Number(feeUFRaw) : null;
  const dueDate = String(formData.get("dueDate") || "");
  const note = String(formData.get("note") || "");
  const clientId = Number(formData.get("clientId"));
  const redirectTo = String(formData.get("redirectTo") || `/clientes/${clientId}?tab=facturacion`);
  if (!proposalId || !title) return redirect(`${redirectTo}?error=missing_fields`);
  try {
    await prisma.milestone.create({
      data: {
        proposalId,
        title,
        feeUF: (feeUF as unknown as Prisma.Decimal) ?? undefined,
        dueDate: dueDate ? new Date(dueDate) : null,
        note: note || null,
      },
    });
    return redirect(`${redirectTo}?ok=milestone_created`);
  } catch {
    return redirect(`${redirectTo}?error=unknown`);
  }
}

export async function updateMilestone(formData: FormData) {
  const milestoneId = Number(formData.get("milestoneId"));
  const title = String(formData.get("title") || "");
  const feeUFRaw = String(formData.get("feeUF") || "");
  const feeUF = feeUFRaw ? Number(feeUFRaw) : null;
  const dueDate = String(formData.get("dueDate") || "");
  const isTriggered = Boolean(formData.get("isTriggered"));
  const triggeredAt = String(formData.get("triggeredAt") || "");
  const note = String(formData.get("note") || "");
  if (!milestoneId || !title) throw new Error("ID y título requeridos.");
  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      title,
      feeUF: (feeUF as unknown as Prisma.Decimal) ?? undefined,
      dueDate: dueDate ? new Date(dueDate) : null,
      isTriggered,
      triggeredAt: isTriggered ? (triggeredAt ? new Date(triggeredAt) : new Date()) : null,
      note: note || null,
    },
  });
}

export async function deleteMilestone(formData: FormData) {
  const milestoneId = Number(formData.get("milestoneId"));
  if (!milestoneId) throw new Error("ID de hito requerido.");
  await prisma.step.updateMany({ where: { milestoneId }, data: { milestoneId: null } });
  await prisma.milestone.delete({ where: { id: milestoneId } });
}

export async function linkProposalToProcedure(formData: FormData) {
  const proposalId = Number(formData.get("proposalId"));
  const procedureId = Number(formData.get("procedureId"));
  const clientId = Number(formData.get("clientId"));
  const redirectTo = String(formData.get("redirectTo") || `/clientes/${clientId}?tab=facturacion`);
  if (!proposalId || !procedureId) return redirect(`${redirectTo}?error=missing_fields`);
  try {
    await prisma.procedure.update({ where: { id: procedureId }, data: { proposalId } });
    return redirect(`${redirectTo}?ok=proposal_linked`);
  } catch {
    return redirect(`${redirectTo}?error=unknown`);
  }
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
  
  // Nuevos campos para plantillas
  const mode = String(formData.get("mode") || "repo"); // "repo" | "custom"
  const templateKey = String(formData.get("templateKey") || "");
  const includeGroupsJson = String(formData.get("includeGroups") || "[]");
  const customStepsJson = String(formData.get("customSteps") || "[]");
  
  // Manejo de tags
  const tagsArray = formData.getAll("tags[]").map(v => String(v)).filter(Boolean);
  const tagsLine = tagsArray.length ? `Tags: ${tagsArray.join(" ")}` : "";
  const generalInfo = [generalInfoRaw, tagsLine].filter(Boolean).join("\n");
  
  try {
    await prisma.$transaction(async (tx) => {
      let clientId = clientIdRaw ? Number(clientIdRaw) : 0;
      if (doCreateClient) {
        const rut = String(formData.get("rut") || "");
        const name = String(formData.get("name") || "");
        const alias = String(formData.get("alias") || "");
        const email = String(formData.get("email") || "");
        const phone = String(formData.get("phone") || "");
        const contacts = String(formData.get("contacts") || "");
        if (!rut || !name) return redirect(`${redirectTo}?error=missing_fields`);
        const exists = await tx.client.findUnique({ where: { rut } });
        if (exists) return redirect(`${redirectTo}?error=rut_exists`);
        const c = await tx.client.create({ data: { rut, name, alias: alias || null, email: email || null, phone: phone || null, contacts: contacts || null } });
        clientId = c.id;
      }
      
      // Resolver stepTitles y typeValue
      let stepTitles: string[] = [];
      let typeValue: string = "";
      
      if (mode === "repo" && templateKey) {
        const includeGroups = JSON.parse(includeGroupsJson || "[]");
        const spec = TEMPLATES_BY_KEY[templateKey];
        if (!spec) throw new Error("Template no encontrada");
        stepTitles = flattenTemplate(spec, { includeGroups });
        typeValue = spec.key; // usamos key estable (ADM_*, JUD_*, etc.)
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
            title: t,
            done: false,
            // doneAt y comment nulos al inicio
          })) }
        }
      });
      
      if (wrJson) {
        try {
          const waterRights = JSON.parse(wrJson) as Array<{ naturaleza: string; foja: string; numero: string; anio: number; cbr: string }>;
          if (waterRights?.length) {
            await tx.waterRight.createMany({ data: waterRights.filter(w => w.foja && w.numero && w.anio && w.cbr).map(w => ({
              procedureId: procedure.id,
              naturaleza: w.naturaleza || "SUBTERRANEO",
              foja: w.foja,
              numero: w.numero,
              anio: Number(w.anio),
              cbr: w.cbr,
            })) });
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

/** Eliminar Gestión (Procedure) con sus dependencias */
export async function deleteProcedureFromForm(formData: FormData) {
  const procedureId = Number(formData.get("procedureId"));
  const redirectTo = String(formData.get("redirectTo") || "/gestiones");
  if (!procedureId) redirect(redirectTo + "?error=unknown");

  await prisma.$transaction(async (tx) => {
    await tx.expense.deleteMany({ where: { procedureId }});
    await tx.todo.deleteMany({ where: { procedureId }});
    await tx.step.deleteMany({ where: { procedureId }});
    await tx.waterRight.deleteMany({ where: { procedureId }});
    await tx.procedure.update({ where: { id: procedureId }, data: { proposalId: null }});
    await tx.procedure.delete({ where: { id: procedureId }});
  });

  revalidatePath("/gestiones");
  redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "ok=procedure_deleted");
}

/** Eliminar Cliente con TODO su arbol (proposals/milestones y procedures/steps/...) */
export async function deleteClientFromForm(formData: FormData) {
  const clientId = Number(formData.get("clientId"));
  const redirectTo = String(formData.get("redirectTo") || "/clientes");
  if (!clientId) redirect(redirectTo + "?error=unknown");

  await prisma.$transaction(async (tx) => {
    // 1) Milestones -> Proposals
    const proposals = await tx.proposal.findMany({ where: { clientId }, select: { id: true }});
    if (proposals.length) {
      await tx.milestone.deleteMany({ where: { proposalId: { in: proposals.map(p => p.id) }}});
      await tx.proposal.deleteMany({ where: { id: { in: proposals.map(p => p.id) }}});
    }

    // 2) Procedures (y dependencias)
    const procedures = await tx.procedure.findMany({ where: { clientId }, select: { id: true }});
    if (procedures.length) {
      const ids = procedures.map(p => p.id);
      await tx.expense.deleteMany({ where: { procedureId: { in: ids }}});
      await tx.todo.deleteMany({ where: { procedureId: { in: ids }}});
      await tx.step.deleteMany({ where: { procedureId: { in: ids }}});
      await tx.waterRight.deleteMany({ where: { procedureId: { in: ids }}});
      await tx.procedure.deleteMany({ where: { id: { in: ids }}});
    }

    // 3) Cliente
    await tx.client.delete({ where: { id: clientId }});
  });

  revalidatePath("/clientes");
  redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "ok=client_deleted");
}

export async function updateClientFromForm(formData: FormData) {
  const redirectTo = String(formData.get("redirectTo") || "/clientes");
  const id = Number(formData.get("id"));
  const rut = String(formData.get("rut") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const alias = (formData.get("alias") as string) || null;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const contacts = (formData.get("contacts") as string) || null; // JSON string
  const notes = (formData.get("notes") as string) || null;

  if (!id || !rut || !name) {
    redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=missing_fields");
  }

  // Validación mínima RUT (sintaxis), no implementar DV completo aquí.
  if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut)) {
    redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=rut_invalid");
  }

  try {
    await prisma.client.update({
      where: { id },
      data: { rut, name, alias, email, phone, contacts, notes },
    });
  } catch (e: any) {
    // P2002 -> unique (rut)
    if (e?.code === "P2002") {
      redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=rut_exists");
    }
    redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "error=unknown");
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "ok=client_updated");
}
