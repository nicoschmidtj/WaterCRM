import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientDetailContent from "./ClientDetailContent";

export const dynamic = "force-dynamic";

async function getData(id: number) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return null;
  const [procedures, proposals] = await Promise.all([
    prisma.procedure.findMany({ where: { clientId: id }, orderBy: { updatedAt: "desc" } }),
    prisma.proposal.findMany({ where: { clientId: id }, include: { milestones: true }, orderBy: { createdAt: "desc" } })
  ]);
  return { client, procedures, proposals };
}

export default async function ClientDetail({ params, searchParams }: { params: { id: string }, searchParams: { tab?: string } }) {
  const id = Number(params.id);
  const tab = searchParams.tab || "info";
  const data = await getData(id);
  if (!data) return notFound();
  const { client, procedures, proposals } = data;

  return <ClientDetailContent client={client} procedures={procedures} proposals={proposals} tab={tab} />;
}
