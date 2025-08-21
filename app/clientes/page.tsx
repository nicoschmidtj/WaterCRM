import { prisma } from "@/lib/prisma";
import { createClient } from "@/app/actions";
import ContactsEditor from "@/components/ContactsEditor";
import SubmitButton from "@/components/SubmitButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Toast from "@/components/Toast";
import NewClientForm from "./NewClientForm";
import ClientsList from "./ClientsList";

export const dynamic = "force-dynamic";

async function getClients(q?: string) {
  return prisma.client.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: { name: "asc" }
  });
}

export default async function ClientesPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";
  const clients = await getClients(q);

  return (
    <main className="space-y-6">
      <Toast />
      
      {/* Header with New Client Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-medium tracking-wide">Clientes</h1>
        <NewClientForm />
      </div>

      {/* Search */}
      <Card className="glass">
        <form className="flex gap-3">
          <input 
            className="input-glass flex-1" 
            placeholder="Buscar por nombre..." 
            name="q" 
            defaultValue={q} 
          />
          <Button type="submit" className="btn-glass">Buscar</Button>
        </form>
      </Card>

      {/* Clients List */}
      <ClientsList clients={clients} q={q} />
    </main>
  );
}

