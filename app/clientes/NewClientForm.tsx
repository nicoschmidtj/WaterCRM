"use client";

import { useState } from "react";
import { createClient } from "@/app/actions";
import ContactsEditor from "@/components/ContactsEditor";
import SubmitButton from "@/components/SubmitButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NewClientForm() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button 
        variant="primary" 
        className="btn-glass"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancelar" : "Nuevo cliente"}
      </Button>

      {showForm && (
        <Card className="glass mt-6">
          <h2 className="text-lg md:text-xl font-medium tracking-wide mb-4">Registrar nuevo cliente</h2>
          <form action={createClient} className="space-y-4">
            <input type="hidden" name="redirectTo" value="/clientes" />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label block mb-1">RUT *</label>
                <input className="input-glass" name="rut" required />
              </div>
              <div>
                <label className="form-label block mb-1">Nombre/Razón social *</label>
                <input className="input-glass" name="name" required />
              </div>
              <div>
                <label className="form-label block mb-1">Alias</label>
                <input className="input-glass" name="alias" />
              </div>
            </div>
            
            <div>
              <label className="form-label block mb-1">Contactos</label>
              <ContactsEditor />
            </div>
            
            <div>
              <label className="form-label block mb-1">Notas</label>
              <textarea className="textarea-glass" name="notes" rows={3} />
            </div>
            
            <div className="flex gap-3">
              <SubmitButton label="Guardar cliente" pendingLabel="Guardando…" />
              <Button 
                type="button" 
                variant="secondary" 
                className="btn-glass"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
