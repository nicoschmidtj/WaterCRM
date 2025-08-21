"use client";

import { useState, useEffect } from "react";
import { 
  CATEGORY_LABELS, 
  CATEGORY_PREFIX, 
  groupTemplatesByCategory,
  type TemplateCategory 
} from "@/lib/procedureRepo";

interface TypeSelectorProps {
  mode?: "repo" | "custom";
  valueCategory?: TemplateCategory | "";
  valueTypeKey?: string;
  onChangeCategory?: (c: TemplateCategory | "") => void;
  onChangeTypeKey?: (k: string) => void;
  nameTypeHidden?: string;
}

export default function TypeSelector({
  mode = "custom",
  valueCategory = "",
  valueTypeKey = "",
  onChangeCategory,
  onChangeTypeKey,
  nameTypeHidden = "type"
}: TypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "">(valueCategory);
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>(valueTypeKey);

  const templatesByCategory = groupTemplatesByCategory();

  // Si mode es "repo", solo renderizar hidden input
  if (mode === "repo") {
    return (
      <input 
        type="hidden" 
        name={nameTypeHidden} 
        value={valueTypeKey || ""} 
      />
    );
  }

  // Modo custom: renderizar selectores
  const handleCategoryChange = (category: TemplateCategory | "") => {
    setSelectedCategory(category);
    setSelectedTypeKey(""); // Resetear tipo al cambiar categoría
    onChangeCategory?.(category);
    onChangeTypeKey?.("");
  };

  const handleTypeChange = (typeKey: string) => {
    setSelectedTypeKey(typeKey);
    onChangeTypeKey?.(typeKey);
  };

  const getTemplatesForCategory = (category: TemplateCategory) => {
    return templatesByCategory[category] || [];
  };

  return (
    <div className="space-y-3">
      {/* Selector de Categoría */}
      <div>
        <label htmlFor="type-category" className="form-label block mb-2">
          Categoría
        </label>
        <select
          id="type-category"
          aria-label="Categoría"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value as TemplateCategory | "")}
          className="select-glass rounded-xl px-3 py-2 w-full text-white"
        >
          <option value="">Seleccionar categoría...</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Subtipo */}
      {selectedCategory && (
        <div>
          <label htmlFor="type-subtype" className="form-label block mb-2">
            Subtipo
          </label>
          <select
            id="type-subtype"
            aria-label="Subtipo"
            value={selectedTypeKey}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="select-glass rounded-xl px-3 py-2 w-full text-white"
          >
            <option value="">Seleccionar subtipo...</option>
            {getTemplatesForCategory(selectedCategory).map((template) => (
              <option key={template.key} value={template.key}>
                {template.label}
              </option>
            ))}
            <option value={`${CATEGORY_PREFIX[selectedCategory]}CUSTOM`}>
              Otro (custom)
            </option>
          </select>
        </div>
      )}

      {/* Hidden input para el valor final */}
      <input 
        type="hidden" 
        name={nameTypeHidden} 
        value={selectedTypeKey || ""} 
      />
    </div>
  );
}
