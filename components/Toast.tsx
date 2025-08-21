"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const OK_MESSAGES: Record<string, string> = {
  client_created: "Cliente creado exitosamente.",
  client_updated: "Cliente actualizado exitosamente.",
  procedure_created: "Gestión creada exitosamente.",
  client_and_procedure_created: "Cliente y gestión creados exitosamente.",
  proposal_created: "Propuesta creada exitosamente.",
  milestone_created: "Hito creado exitosamente.",
  proposal_linked: "Propuesta vinculada a la gestión.",
  client_deleted: "Cliente eliminado exitosamente.",
  procedure_deleted: "Gestión eliminada exitosamente.",
};

const ERROR_MESSAGES: Record<string, string> = {
  rut_exists: "⚠️ RUT ya registrado.",
  rut_invalid: "⚠️ RUT con formato inválido.",
  missing_fields: "⚠️ Completa los campos obligatorios.",
  unknown: "⚠️ No se pudo completar la acción. Intenta nuevamente.",
};

export default function Toast() {
  const search = useSearchParams();
  const router = useRouter();
  const ok = search.get("ok");
  const error = search.get("error");

  const [visible, setVisible] = useState<boolean>(Boolean(ok || error));
  const message = useMemo(() => {
    if (ok && OK_MESSAGES[ok]) return OK_MESSAGES[ok];
    if (error && ERROR_MESSAGES[error]) return ERROR_MESSAGES[error];
    if (error) return ERROR_MESSAGES.unknown;
    return "";
  }, [ok, error]);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      const params = new URLSearchParams(Array.from(search.entries()));
      params.delete("ok");
      params.delete("error");
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (!visible || !message) return null;

  const isError = Boolean(error);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        glass rounded-2xl px-4 py-3
        ${isError ? 'border-red-400/30' : 'border-green-400/30'}
      `}>
        <div className={`text-sm font-medium ${
          isError ? 'text-red-300' : 'text-green-300'
        }`}>
          {message}
        </div>
      </div>
    </div>
  );
}


