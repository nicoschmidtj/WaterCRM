import { prisma } from "@/lib/prisma";

export async function getUFRateAtOrBefore(date: Date) {
  const exact = await prisma.uFRate.findUnique({ where: { date } });
  if (exact) return exact.value;
  const prev = await prisma.uFRate.findFirst({
    where: { date: { lte: date } },
    orderBy: { date: "desc" },
  });
  return prev?.value ?? null;
}


