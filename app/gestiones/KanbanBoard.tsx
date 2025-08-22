"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { moveToStatus, moveToStage, toggleTag } from "@/app/gestiones/kanban-actions";
import Chip from "@/components/ui/Chip";

export type KanbanCard = {
  id: number;
  clientName: string;
  title: string;
  templateLabel?: string;
  region?: string | null;
  lastActionAt?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  typeKey?: string;
  priority?: "ALTA" | "MEDIA" | "BAJA" | null;
  tags?: string[];
};

export type KanbanProps = {
  mode: "estado" | "etapas";
  typeFilter?: string | null;
  columns: { key: string; label: string; count: number }[];
  lanes: Record<string, KanbanCard[]>;
  paging?: Record<string, { hasMore: boolean }>;
  onLoadMore?: (colKey: string) => void;
};

function DraggableCard({ card, col }: { card: KanbanCard; col: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
    data: { col },
  });
  const { role: _role, tabIndex: _tabIndex, ...restAttributes } = attributes;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [, startTransition] = useTransition();

  const handleTag = (tag: "#Delegable" | "#Prioridad") => {
    startTransition(() => toggleTag({ procedureId: card.id, tag }));
  };
  const hasDelegable = card.tags?.includes("#Delegable");
  const hasPrioridad = card.tags?.includes("#Prioridad");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass rounded-xl p-3 mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      {...restAttributes}
      {...listeners}
      role="listitem"
      tabIndex={0}
      aria-label={`Mover gestión ${card.title}`}
    >
      <div className="font-medium text-sm mb-1">{card.clientName}</div>
      <div className="text-xs text-ink-muted mb-2">
        {card.title}
        {card.templateLabel && ` – ${card.templateLabel}`}
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {card.tags?.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => handleTag("#Delegable")}
          className="underline"
          aria-label="Alternar #Delegable"
          aria-pressed={hasDelegable}
        >
          #Delegable
        </button>
        <button
          onClick={() => handleTag("#Prioridad")}
          className="underline"
          aria-label="Alternar #Prioridad"
          aria-pressed={hasPrioridad}
        >
          #Prioridad
        </button>
      </div>
    </div>
  );
}

export default function KanbanBoard({
  mode,
  typeFilter,
  columns,
  lanes,
  paging = {},
  onLoadMore,
}: KanbanProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const fromCol = active.data.current?.col as string;
    const toCol = (over.data.current?.col as string) || (over.id as string);
    if (!fromCol || !toCol || fromCol === toCol) return;
    startTransition(async () => {
      if (mode === "estado") {
        await moveToStatus({
          procedureId: Number(active.id),
          toStatus: toCol as "PENDING" | "IN_PROGRESS" | "DONE",
        });
      } else if (typeFilter) {
        await moveToStage({ procedureId: Number(active.id), typeKey: typeFilter, toStageKey: toCol, strict: false });
      }
      router.refresh();
    });
  };

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {columns.map((col) => (
          <Lane
            key={col.key}
            column={col}
            cards={lanes[col.key] || []}
            paging={paging[col.key]}
            onLoadMore={onLoadMore}
          />
        ))}
      </DndContext>
    </div>
  );
}

function Lane({
  column,
  cards,
  paging,
  onLoadMore,
}: {
  column: { key: string; label: string; count: number };
  cards: KanbanCard[];
  paging?: { hasMore: boolean };
  onLoadMore?: (colKey: string) => void;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col h-[calc(100vh-180px)]">
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-white font-medium">{column.label}</h2>
        <span className="glass px-2 py-0.5 text-xs rounded-full">{column.count}</span>
      </header>
      <div className="flex-1 overflow-auto" role="list">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <DraggableCard key={card.id} card={card} col={column.key} />
          ))}
        </SortableContext>
        {paging?.hasMore && onLoadMore && (
          <button
            className="mt-2 text-xs underline"
            onClick={() => onLoadMore(column.key)}
          >
            Mostrar más
          </button>
        )}
      </div>
    </div>
  );
}
