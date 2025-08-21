"use client";
import { useEffect, useMemo, useState } from "react";

type Contact = {
  nombre: string;
  cargo?: string;
  correo?: string;
  telefono?: string;
};

type Props = {
  name?: string;
  defaultValue?: string; // JSON string
};

export default function ContactsEditor({ name = "contacts", defaultValue }: Props) {
  const initial: Contact[] = useMemo(() => {
    try {
      return defaultValue ? (JSON.parse(defaultValue) as Contact[]) : [];
    } catch {
      return [];
    }
  }, [defaultValue]);
  const [contacts, setContacts] = useState<Contact[]>(initial.length ? initial : [{ nombre: "" }]);

  useEffect(() => {
    if (contacts.length === 0) setContacts([{ nombre: "" }]);
  }, [contacts.length]);

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={JSON.stringify(contacts)} />
      {contacts.map((c, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2">
          <div>
            <label className="form-label block mb-1">Nombre *</label>
            <input 
              className="input-glass" 
              placeholder="Nombre completo" 
              value={c.nombre || ""}
              onChange={e => update(idx, { ...c, nombre: e.target.value })} 
            />
          </div>
          <div>
            <label className="form-label block mb-1">Cargo</label>
            <input 
              className="input-glass" 
              placeholder="Cargo o función" 
              value={c.cargo || ""}
              onChange={e => update(idx, { ...c, cargo: e.target.value })} 
            />
          </div>
          <div>
            <label className="form-label block mb-1">Email</label>
            <input 
              className="input-glass" 
              type="email"
              placeholder="correo@ejemplo.com" 
              value={c.correo || ""}
              onChange={e => update(idx, { ...c, correo: e.target.value })} 
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="form-label block mb-1">Teléfono</label>
              <input 
                className="input-glass" 
                placeholder="+56 9 1234 5678" 
                value={c.telefono || ""}
                onChange={e => update(idx, { ...c, telefono: e.target.value })} 
              />
            </div>
            <button 
              type="button" 
              className="btn-ghost self-end" 
              onClick={() => remove(idx)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
      <div>
        <button 
          type="button" 
          className="btn-glass" 
          onClick={() => setContacts([...contacts, { nombre: "" }])}
        >
          Agregar contacto
        </button>
      </div>
    </div>
  );

  function update(index: number, value: Contact) {
    setContacts(prev => prev.map((p, i) => (i === index ? value : p)));
  }
  function remove(index: number) {
    setContacts(prev => prev.filter((_, i) => i !== index));
  }
}


