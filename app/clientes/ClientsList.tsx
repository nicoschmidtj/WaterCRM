import Link from "next/link";
import Card from "@/components/ui/Card";
import { deleteClientFromForm } from "@/app/actions";
import ConfirmForm from "@/components/ConfirmForm";

interface ClientsListProps {
  clients: any[];
  q: string;
}

export default function ClientsList({ clients, q }: ClientsListProps) {
  return (
    <Card className="glass">
      <div className="space-y-3">
        {clients.length > 0 ? (
          clients.map((c: any) => (
            <div key={c.id} className="flex items-center space-x-2">
              <Link 
                href={`/clientes/${c.id}`} 
                className="flex-1 block p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-ink mb-1">{c.name}</div>
                    <div className="text-sm text-ink-muted">
                      {c.email || "—"} · {c.phone || "—"} · RUT: {c.rut || "—"}
                    </div>
                  </div>
                  <div className="text-ink-muted text-sm">→</div>
                </div>
              </Link>
                             <ConfirmForm action={deleteClientFromForm}
                 hidden={{ clientId: c.id, redirectTo: "/clientes" }}
                 confirmMessage="¿Eliminar cliente y todo su contenido?">
                 <button className="btn-glass rounded-xl p-2 text-red-400 hover:text-red-300" aria-label="Eliminar cliente">
                   🗑️
                 </button>
               </ConfirmForm>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-ink-muted">
            {q ? "No se encontraron clientes con ese nombre." : "Sin clientes aún."}
          </div>
        )}
      </div>
    </Card>
  );
}
