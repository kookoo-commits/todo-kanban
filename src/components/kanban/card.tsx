import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ColumnId, KanbanCard } from "@/lib/board-store";
import { cn } from "@/lib/utils";

const MARK: Record<ColumnId, string> = {
  todo: "bg-todo",
  doing: "bg-doing",
  done: "bg-done",
};

type CardFaceProps = {
  card: KanbanCard;
  columnId: ColumnId;
  overlay?: boolean;
  dragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function CardFace({
  card,
  columnId,
  overlay = false,
  dragging = false,
  onEdit,
  onDelete,
}: CardFaceProps) {
  return (
    <article
      className={cn(
        "kanban-card relative rounded-md bg-paper p-3.5 pl-4",
        overlay && "is-overlay",
        dragging && "is-dragging",
      )}
    >
      <span
        className={cn(
          "absolute top-3 bottom-3 left-0 w-1 rounded-r-xs",
          MARK[columnId],
        )}
        aria-hidden="true"
      />
      <div className="flex items-start gap-2">
        <GripVertical
          className="mt-0.5 size-4 shrink-0 text-faint"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium leading-snug text-ink">
            {card.title}
          </h3>
          {card.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-normal text-muted">
              {card.description}
            </p>
          ) : null}
        </div>
        {onEdit || onDelete ? (
          <div className="card-actions -mr-1 -mt-1 flex shrink-0">
            {onEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`${card.title} 수정`}
                className="text-muted"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`${card.title} 삭제`}
                className="text-muted hover:text-danger"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

type SortableCardProps = {
  card: KanbanCard;
  columnId: ColumnId;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
};

export function SortableCard({
  card,
  columnId,
  onEdit,
  onDelete,
  onOpen,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });
  const skipClick = useRef(false);

  useEffect(() => {
    if (isDragging) skipClick.current = true;
  }, [isDragging]);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn("cursor-grab touch-none", isDragging && "z-10 cursor-grabbing")}
      {...attributes}
      {...listeners}
      role="listitem"
      aria-label={card.title}
      onClick={() => {
        if (skipClick.current) {
          skipClick.current = false;
          return;
        }
        onOpen();
      }}
    >
      <CardFace
        card={card}
        columnId={columnId}
        dragging={isDragging}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
