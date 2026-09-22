import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ColumnId, KanbanCard } from "@/lib/board-store";
import { COLUMNS } from "@/lib/board-store";
import { cn } from "@/lib/utils";
import { CardFace, SortableCard } from "./card";

const MARK: Record<ColumnId, string> = {
  todo: "bg-todo",
  doing: "bg-doing",
  done: "bg-done",
};

type ColumnProps = {
  columnId: ColumnId;
  cards: KanbanCard[];
  interactive: boolean;
  onAdd: () => void;
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
};

export function KanbanColumn({
  columnId,
  cards,
  interactive,
  onAdd,
  onEdit,
  onDelete,
}: ColumnProps) {
  const meta = COLUMNS.find((column) => column.id === columnId);

  return (
    <section
      data-column={columnId}
      className="kanban-column flex min-h-0 shrink-0 snap-start flex-col rounded-xl bg-surface p-3 shadow-column"
      aria-label={`${meta?.title ?? ""} 열, 카드 ${cards.length}개`}
    >
      <header className="flex items-center gap-2 px-1 pb-3">
        <span
          className={cn("size-2 rounded-full", MARK[columnId])}
          aria-hidden="true"
        />
        <h2 className="text-sm font-medium tracking-tight text-ink">
          {meta?.title}
        </h2>
        <span className="tabular-nums text-sm text-muted">{cards.length}</span>
      </header>

      {interactive ? (
        <InteractiveList
          columnId={columnId}
          cards={cards}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <div className="flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-0.5">
          <CardList
            columnId={columnId}
            cards={cards}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        className="mt-2 h-11 w-full justify-center text-muted hover:text-ink"
        onClick={onAdd}
      >
        <Plus className="size-4" />
        카드 추가
      </Button>
    </section>
  );
}

function InteractiveList({
  columnId,
  cards,
  onEdit,
  onDelete,
}: {
  columnId: ColumnId;
  cards: KanbanCard[];
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const ids = cards.map((card) => card.id);

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        role="list"
        aria-label={`${COLUMNS.find((column) => column.id === columnId)?.title ?? ""} 카드`}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-0.5 transition-[background-color,box-shadow] duration-150",
          isOver && "column-over",
        )}
      >
        {cards.length === 0 ? (
          <EmptyState hint={COLUMNS.find((column) => column.id === columnId)?.hint} />
        ) : (
          cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              columnId={columnId}
              onEdit={() => onEdit(card.id)}
              onDelete={() => onDelete(card.id)}
              onOpen={() => onEdit(card.id)}
            />
          ))
        )}
      </div>
    </SortableContext>
  );
}

function CardList({
  columnId,
  cards,
  onEdit,
  onDelete,
}: {
  columnId: ColumnId;
  cards: KanbanCard[];
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}) {
  if (cards.length === 0) {
    return (
      <EmptyState hint={COLUMNS.find((column) => column.id === columnId)?.hint} />
    );
  }

  return cards.map((card) => (
    <div
      key={card.id}
      className="cursor-grab"
      onClick={() => onEdit(card.id)}
    >
      <CardFace
        card={card}
        columnId={columnId}
        onEdit={() => onEdit(card.id)}
        onDelete={() => onDelete(card.id)}
      />
    </div>
  ));
}

function EmptyState({ hint }: { hint?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-line px-4 py-8 text-center">
      <p className="text-sm text-muted">아직 카드가 없습니다</p>
      {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
