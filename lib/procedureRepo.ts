export type TemplateCategory = "ADMIN" | "JUDICIAL" | "OTROS" | "CORRETAJE";
export type TemplateKey = string; // ej: "ADM_PERFECCIONAMIENTO"

export type TemplateBlock =
  | { type: "step"; title: string }
  | { type: "group"; title: string; optional?: boolean; steps: string[] };

export type TemplateSpec = {
  key: TemplateKey;
  label: string;          // "Administrativo – Perfeccionamiento"
  category: TemplateCategory;
  steps: TemplateBlock[]; // mezcla de steps y grupos (opcionales)
};

export const CATEGORY_LABELS = {
  ADMIN: "Administrativo",
  JUDICIAL: "Judicial",
  OTROS: "Otros",
  CORRETAJE: "Corretaje",
} as const;

export const CATEGORY_PREFIX: Record<TemplateCategory, string> = {
  ADMIN: "ADM_",
  JUDICIAL: "JUD_", 
  OTROS: "OTR_",
  CORRETAJE: "COR_",
};

export function groupTemplatesByCategory() {
  return {
    ADMIN: TEMPLATES.filter(t => t.key.startsWith(CATEGORY_PREFIX.ADMIN)),
    JUDICIAL: TEMPLATES.filter(t => t.key.startsWith(CATEGORY_PREFIX.JUDICIAL)),
    OTROS: TEMPLATES.filter(t => t.key.startsWith(CATEGORY_PREFIX.OTROS)),
    CORRETAJE: TEMPLATES.filter(t => t.key.startsWith(CATEGORY_PREFIX.CORRETAJE)),
  } as const;
}

export function flattenTemplate(spec: TemplateSpec, options?: { includeGroups?: string[] }): string[] {
  const include = new Set(options?.includeGroups ?? []);
  const out: string[] = [];
  for (const b of spec.steps) {
    if (b.type === "step") out.push(b.title);
    else {
      const take = !b.optional || include.has(b.title);
      if (take) out.push(...b.steps);
    }
  }
  return out;
}

export const TEMPLATES: TemplateSpec[] = [
  // ADMINISTRATIVO
  {
    key: "ADM_PERFECCIONAMIENTO",
    label: "Administrativo – Perfeccionamiento",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      {
        type: "group",
        title: "Reparos",
        optional: true,
        steps: [
          "Recopilación antecedentes",
          "Redacción escrito reparo",
          "Envío escrito y antecedentes reparos",
          "Acuse recibo escrito reparos",
        ]
      },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Cotizar publicaciones legales" },
      { type: "step", title: "Publicaciones legales" },
      { type: "step", title: "Solicitud fondos Visita Técnica" },
      { type: "step", title: "Envío fondos Visita Técnica" },
      { type: "step", title: "Acuse recibo fondos Visita Técnica" },
      { type: "step", title: "Coordinación Visita Técnica" },
      { type: "step", title: "Resolución final" },
      { type: "step", title: "Fondos para anotar resolución en CBR" },
      { type: "step", title: "Anotación en CBR" },
    ],
  },
  {
    key: "ADM_CAMBIO_PUNTO",
    label: "Administrativo – Cambio de Punto de Captación",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      {
        type: "group",
        title: "Reparos",
        optional: true,
        steps: [
          "Recopilación antecedentes",
          "Redacción escrito reparo",
          "Envío escrito y antecedentes reparos",
          "Acuse recibo escrito reparos",
        ]
      },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Cotizar publicaciones legales" },
      { type: "step", title: "Publicaciones legales" },
      { type: "step", title: "Solicitud fondos Visita Técnica" },
      { type: "step", title: "Envío fondos Visita Técnica" },
      { type: "step", title: "Acuse recibo fondos Visita Técnica" },
      { type: "step", title: "Coordinación Visita Técnica" },
      { type: "step", title: "Resolución final" },
      { type: "step", title: "Fondos para anotar resolución en CBR" },
      { type: "step", title: "Anotación en CBR" },
    ],
  },
  {
    key: "ADM_REGULARIZACION_2T",
    label: "Administrativo – Regularización 2T",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      {
        type: "group",
        title: "Reparos",
        optional: true,
        steps: [
          "Recopilación antecedentes",
          "Redacción escrito reparo",
          "Envío escrito y antecedentes reparos",
          "Acuse recibo escrito reparos",
        ]
      },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Cotizar publicaciones legales" },
      { type: "step", title: "Publicaciones legales" },
      { type: "step", title: "Solicitud fondos Visita Técnica" },
      { type: "step", title: "Envío fondos Visita Técnica" },
      { type: "step", title: "Acuse recibo fondos Visita Técnica" },
      { type: "step", title: "Coordinación Visita Técnica" },
      { type: "step", title: "Resolución final" },
      { type: "step", title: "Fondos para anotar resolución en CBR" },
      { type: "step", title: "Anotación en CBR" },
    ],
  },
  {
    key: "ADM_REGULARIZACION_13T",
    label: "Administrativo – Regularización 13T",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      {
        type: "group",
        title: "Reparos",
        optional: true,
        steps: [
          "Recopilación antecedentes",
          "Redacción escrito reparo",
          "Envío escrito y antecedentes reparos",
          "Acuse recibo escrito reparos",
        ]
      },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Cotizar publicaciones legales" },
      { type: "step", title: "Publicaciones legales" },
      { type: "step", title: "Solicitud fondos Visita Técnica" },
      { type: "step", title: "Envío fondos Visita Técnica" },
      { type: "step", title: "Acuse recibo fondos Visita Técnica" },
      { type: "step", title: "Coordinación Visita Técnica" },
      { type: "step", title: "Resolución final" },
      { type: "step", title: "Fondos para anotar resolución en CBR" },
      { type: "step", title: "Anotación en CBR" },
    ],
  },
  {
    key: "ADM_TRASLADO",
    label: "Administrativo – Traslado",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      {
        type: "group",
        title: "Reparos",
        optional: true,
        steps: [
          "Recopilación antecedentes",
          "Redacción escrito reparo",
          "Envío escrito y antecedentes reparos",
          "Acuse recibo escrito reparos",
        ]
      },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Cotizar publicaciones legales" },
      { type: "step", title: "Publicaciones legales" },
      { type: "step", title: "Solicitud fondos Visita Técnica" },
      { type: "step", title: "Envío fondos Visita Técnica" },
      { type: "step", title: "Acuse recibo fondos Visita Técnica" },
      { type: "step", title: "Coordinación Visita Técnica" },
      { type: "step", title: "Resolución final" },
      { type: "step", title: "Fondos para anotar resolución en CBR" },
      { type: "step", title: "Anotación en CBR" },
    ],
  },
  {
    key: "ADM_NUEVO_DERECHO",
    label: "Administrativo – Nuevo Derecho",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      {
        type: "group",
        title: "Reparos",
        optional: true,
        steps: [
          "Recopilación antecedentes",
          "Redacción escrito reparo",
          "Envío escrito y antecedentes reparos",
          "Acuse recibo escrito reparos",
        ]
      },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Cotizar publicaciones legales" },
      { type: "step", title: "Publicaciones legales" },
      { type: "step", title: "Solicitud fondos Visita Técnica" },
      { type: "step", title: "Envío fondos Visita Técnica" },
      { type: "step", title: "Acuse recibo fondos Visita Técnica" },
      { type: "step", title: "Coordinación Visita Técnica" },
      { type: "step", title: "Resolución final" },
      { type: "step", title: "Fondos para anotar resolución en CBR" },
      { type: "step", title: "Anotación en CBR" },
    ],
  },
  {
    key: "ADM_AUTORIZACION_EXTRAORDINARIA",
    label: "Administrativo – Autorización Extraordinaria DAA",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Resolución final" },
    ],
  },
  {
    key: "ADM_PATENTES",
    label: "Administrativo – Patentes",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Acuse recibo de presentación" },
      { type: "step", title: "Admisibilidad" },
      { type: "step", title: "Resolución final" },
    ],
  },
  {
    key: "ADM_CPA",
    label: "Administrativo – CPA",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Resolución final" },
    ],
  },
  {
    key: "ADM_OTROS",
    label: "Administrativo – Otros",
    category: "ADMIN",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
  // JUDICIAL
  {
    key: "JUD_PERFECCIONAMIENTO",
    label: "Judicial – Perfeccionamiento",
    category: "JUDICIAL",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Cumple lo ordenado – Acredita Poder" },
      { type: "step", title: "Fija audiencia de contestación y conciliación" },
      { type: "step", title: "Encargar Notificación Audiencia" },
      { type: "step", title: "Notificación Audiencia" },
      { type: "step", title: "Realización audiencia contestación y conciliación" },
      { type: "step", title: "Dictación Auto de Prueba" },
      { type: "step", title: "Encargar Notificación AP" },
      { type: "step", title: "Notificación AP" },
      { type: "step", title: "Redactar escrito AP" },
      { type: "step", title: "Presentar escrito AP" },
      { type: "step", title: "Solicitar – Cite a oír sentencia" },
      { type: "step", title: "Resolución – Cita a oír sentencia" },
      { type: "step", title: "Sentencia" },
      { type: "step", title: "Encargar Notificación Sentencia" },
      { type: "step", title: "Notificación Sentencia DGA" },
      { type: "step", title: "Firme y Ejecutoriada" },
      { type: "step", title: "Solicitar exhorto" },
      { type: "step", title: "Encargar Notificación Sentencia CBR" },
      { type: "step", title: "Notificación Sentencia CBR" },
      { type: "step", title: "Ingresar a CPA" },
      { type: "step", title: "CPA Listo" },
    ],
  },
  {
    key: "JUD_PATENTE",
    label: "Judicial – Patente",
    category: "JUDICIAL",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación" },
      { type: "step", title: "Cumple lo ordenado – Acredita Poder" },
      { type: "step", title: "Resolución – Exime patente del listado" },
    ],
  },
  {
    key: "JUD_REGULARIZACION_2T",
    label: "Judicial – Regularización 2T",
    category: "JUDICIAL",
    steps: [
      { type: "step", title: "Definir estrategia y pasos" }
    ]
  },
  {
    key: "JUD_OUA",
    label: "Judicial – OUA",
    category: "JUDICIAL",
    steps: [
      { type: "step", title: "Definir estrategia y pasos" }
    ]
  },
  {
    key: "JUD_OTRO",
    label: "Judicial – Otro",
    category: "JUDICIAL",
    steps: [
      { type: "step", title: "Definir estrategia y pasos" }
    ]
  },
  // OTROS
  {
    key: "OTR_CBR",
    label: "Otros – CBR",
    category: "OTROS",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
  {
    key: "OTR_SII",
    label: "Otros – SII",
    category: "OTROS",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
  {
    key: "OTR_TGR",
    label: "Otros – TGR",
    category: "OTROS",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
  {
    key: "OTR_DPP",
    label: "Otros – DPP",
    category: "OTROS",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
  {
    key: "OTR_TRANSPARENCIA",
    label: "Otros – Transparencia",
    category: "OTROS",
    steps: [
      { type: "step", title: "Ingresar Solicitud" },
      { type: "step", title: "Recibir Respuesta Transparencia" },
    ],
  },
  {
    key: "OTR_INFORMES",
    label: "Otros – Informes",
    category: "OTROS",
    steps: [
      { type: "step", title: "Recopilación de antecedentes" },
      {
        type: "group",
        title: "Solicitud de info por Transparencia",
        optional: true,
        steps: ["Ingresar Solicitud", "Recibir Respuesta Transparencia"]
      },
      { type: "step", title: "Redacción" },
      { type: "step", title: "Presentación de informe" },
    ],
  },
  // CORRETAJE
  {
    key: "COR_ESTUDIO_TITULOS",
    label: "Corretaje – Estudio de Títulos",
    category: "CORRETAJE",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
  {
    key: "COR_COMPRAVENTA",
    label: "Corretaje – Compraventa",
    category: "CORRETAJE",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
  {
    key: "COR_BUSQUEDA_DAA",
    label: "Corretaje – Búsqueda DAA",
    category: "CORRETAJE",
    steps: [
      { type: "step", title: "Definir alcance y pasos" }
    ]
  },
];

export const TEMPLATES_BY_KEY = Object.fromEntries(TEMPLATES.map(t => [t.key, t]));

export function listByCategory(cat: TemplateCategory) {
  return TEMPLATES.filter(t => t.category === cat);
}
