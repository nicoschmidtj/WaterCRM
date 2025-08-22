"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCorners,
  useDroppable,
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

function DraggableCard({ card }: { card: KanbanCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `card:${card.id}` });
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
      className={`glass rounded-xl border border-white/10 p-3 shadow-sm hover:shadow-md transition-all will-change-transform ${
        isDragging ? "ring-1 ring-white/20" : ""
      }`}
      {...restAttributes}
      {...listeners}
      role="listitem"
      tabIndex={0}
      aria-label={`Mover gestión ${card.title}`}
    >
      <div className="font-medium text-ink truncate">{card.title}</div>
      <div className="text-xs text-ink-muted flex gap-2 flex-wrap mt-1">
        <span>{card.clientName}</span>
        {card.templateLabel && <span>{card.templateLabel}</span>}
        {card.lastActionAt && <span>{new Date(card.lastActionAt).toLocaleDateString()}</span>}
      </div>
      <div className="flex gap-1 flex-wrap mt-2">
        {card.tags?.map((t) => (
          <Chip key={t} className="badge-glass text-[10px] px-2 py-0.5">
            {t}
          </Chip>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => handleTag("#Delegable")}
          className={`btn-glass btn-xs ${hasDelegable ? "ring-1 ring-cyan-300/60" : ""}`}
          aria-label="Alternar #Delegable"
          aria-pressed={hasDelegable}
        >
          #Delegable
        </button>
        <button
          onClick={() => handleTag("#Prioridad")}
          className={`btn-glass btn-xs ${hasPrioridad ? "ring-1 ring-cyan-300/60" : ""}`}
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

  const findColumnKeyByCardId = (cardId: string) => {
    for (const key of Object.keys(lanes)) {
      if (lanes[key]?.some((c) => `card:${c.id}` === cardId)) return key;
    }
    return null;
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const fromCol = findColumnKeyByCardId(activeId);
    const toCol = overId.startsWith("lane:")
      ? overId.replace("lane:", "")
      : findColumnKeyByCardId(overId);
    if (!toCol || !fromCol || toCol === fromCol) return;
    startTransition(async () => {
      if (mode === "estado") {
        await moveToStatus({
          procedureId: Number(activeId.replace("card:", "")),
          toStatus: toCol as any,
        });
      } else if (typeFilter) {
        await moveToStage({
          procedureId: Number(activeId.replace("card:", "")),
          typeKey: typeFilter,
          toStageKey: toCol,
          strict: false,
        });
      }
      router.refresh();
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
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
  const { setNodeRef } = useDroppable({ id: `lane:${column.key}` });
  return (
    <div className="flex flex-col gap-3 min-w-[320px] max-w-[420px] w-full">
      <header className="sticky top-0 z-10 glass border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between backdrop-blur-md">
        <h2 className="text-white font-medium">{column.label}</h2>
        <span className="badge-glass text-[11px] px-2 py-0.5">{column.count}</span>
      </header>
      <div
        ref={setNodeRef}
        className="mt-2 flex-1 overflow-auto rounded-xl border border-white/10 bg-white/5 p-2 space-y-2"
        role="list"
      >
        <SortableContext
          items={cards.map((c) => `card:${c.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <DraggableCard key={card.id} card={card} />
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
