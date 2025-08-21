"use client";

import { useState, useEffect } from "react";
import { TEMPLATES, CATEGORY_LABELS, type TemplateCategory, type TemplateSpec } from "@/lib/procedureRepo";

type Props = {
  nameMode: string;           // "mode"
  nameTemplateKey: string;    // "templateKey"
  nameIncludeGroups: string;  // "includeGroups" (JSON string de títulos)
  nameCustomSteps: string;    // "customSteps" (JSON string de pasos)
  modeDefault?: "repo" | "custom";
  onModeChange?: (mode: "repo" | "custom") => void;
};

export default function TemplatePicker({
  nameMode,
  nameTemplateKey,
  nameIncludeGroups,
  nameCustomSteps,
  modeDefault = "repo",
  onModeChange
}: Props) {
  const [mode, setMode] = useState<"repo" | "custom">(modeDefault);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("ADMIN");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [includeGroups, setIncludeGroups] = useState<string[]>([]);
  const [customSteps, setCustomSteps] = useState<string[]>(["Definir etapas"]);

  // Filtrar plantillas por categoría
  const templatesInCategory = TEMPLATES.filter(t => t.category === selectedCategory);

  // Obtener plantilla seleccionada
  const selectedTemplateSpec = TEMPLATES.find(t => t.key === selectedTemplate);

  // Obtener grupos opcionales de la plantilla
  const optionalGroups = selectedTemplateSpec?.steps.filter(s => s.type === "group" && s.optional) || [];

  // Actualizar includeGroups cuando cambia la plantilla
  useEffect(() => {
    if (selectedTemplate) {
      setIncludeGroups([]);
    }
  }, [selectedTemplate]);

  // Notificar cambio de modo al padre
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // Agregar paso personalizado
  const addCustomStep = () => {
    setCustomSteps([...customSteps, ""]);
  };

  // Eliminar paso personalizado
  const removeCustomStep = (index: number) => {
    setCustomSteps(customSteps.filter((_, i) => i !== index));
  };

  // Actualizar paso personalizado
  const updateCustomStep = (index: number, value: string) => {
    const newSteps = [...customSteps];
    newSteps[index] = value;
    setCustomSteps(newSteps);
  };

  return (
    <div className="space-y-6 p-6 glass rounded-lg">
      <div className="space-y-4">
        {/* Toggle Mode */}
                 <div className="flex items-center space-x-4">
           <label className="form-label">
             Modo de creación:
           </label>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode("repo")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "repo"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Desde plantilla
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "custom"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Desde cero
            </button>
          </div>
        </div>

        {/* Hidden inputs */}
        <input type="hidden" name={nameMode} value={mode} />
        <input type="hidden" name={nameTemplateKey} value={selectedTemplate} />
        <input type="hidden" name={nameIncludeGroups} value={JSON.stringify(includeGroups)} />
        <input type="hidden" name={nameCustomSteps} value={JSON.stringify(customSteps.filter(Boolean))} />
        {mode === "repo" && selectedTemplate && selectedTemplateSpec && (
          <input type="hidden" name="type" value={selectedTemplateSpec.key} />
        )}

        {mode === "repo" ? (
          /* Modo Plantilla */
          <div className="space-y-4">
            {/* Selector de Categoría */}
                         <div>
               <label htmlFor="category" className="form-label block mb-2">
                 Categoría
               </label>
                             <select
                 id="category"
                 value={selectedCategory}
                 onChange={(e) => {
                   setSelectedCategory(e.target.value as TemplateCategory);
                   setSelectedTemplate("");
                 }}
                 className="select-glass rounded-xl px-3 py-2 w-full"
               >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Plantilla */}
                         <div>
               <label htmlFor="template" className="form-label block mb-2">
                 Plantilla
               </label>
                             <select
                 id="template"
                 value={selectedTemplate}
                 onChange={(e) => setSelectedTemplate(e.target.value)}
                 className="select-glass rounded-xl px-3 py-2 w-full"
               >
                <option value="">Seleccionar plantilla...</option>
                {templatesInCategory.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grupos Opcionales */}
            {optionalGroups.length > 0 && (
                             <div>
                 <label className="form-label block mb-2">
                   Grupos opcionales (marcar para incluir):
                 </label>
                <div className="space-y-2">
                  {optionalGroups.map((group) => (
                    <div key={group.title} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`group-${group.title}`}
                        checked={includeGroups.includes(group.title)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIncludeGroups([...includeGroups, group.title]);
                          } else {
                            setIncludeGroups(includeGroups.filter(g => g !== group.title));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                                             <label htmlFor={`group-${group.title}`} className="ml-2 form-label">
                         {group.title}
                       </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

                         {/* Vista previa de pasos */}
             {selectedTemplate && selectedTemplateSpec && (
               <div>
                 <div className="mb-3">
                   <div className="badge-glass rounded-full px-3 py-1 text-xs">
                     Tipo: {selectedTemplateSpec.key} — {selectedTemplateSpec.label}
                   </div>
                 </div>
                 <label className="form-label block mb-2">
                   Pasos de la plantilla:
                 </label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 max-h-48 overflow-y-auto">
                  {selectedTemplateSpec?.steps.map((step, index) => (
                    <div key={index} className="mb-2">
                      {step.type === "step" ? (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          • {step.title}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            📁 {step.title} {step.optional && "(Opcional)"}
                          </div>
                          {step.steps.map((subStep, subIndex) => (
                            <div key={subIndex} className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                              • {subStep}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Modo Personalizado */
          <div className="space-y-4">
                         <div>
               <label className="form-label block mb-2">
                 Pasos personalizados:
               </label>
              <div className="space-y-2">
                {customSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateCustomStep(index, e.target.value)}
                      placeholder={`Paso ${index + 1}`}
                      className="flex-1 input-glass rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {customSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCustomStep(index)}
                        className="btn-glass px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCustomStep}
                  className="btn-glass px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Agregar paso
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
