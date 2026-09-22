import {
  closestCorners,
  DndContext,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  COLUMN_IDS,
  COLUMNS,
  findColumn,
  type ColumnId,
  useBoardStore,
} from "@/lib/board-store";
import { CardFace } from "./card";
import { CardDialog } from "./card-dialog";
import { KanbanColumn } from "./column";

const COLUMN_SET = new Set<string>(COLUMN_IDS);

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  const overCard = pointer.filter((hit) => !COLUMN_SET.has(String(hit.id)));
  if (overCard.length > 0) return overCard;
  if (pointer.length > 0) return pointer;
  const corners = closestCorners(args);
  const cornerCard = corners.filter((hit) => !COLUMN_SET.has(String(hit.id)));
  if (cornerCard.length > 0) return cornerCard;
  return corners;
};

type EditorState =
  | { mode: "closed" }
  | { mode: "create"; columnId: ColumnId }
  | { mode: "edit"; cardId: string };

export function KanbanBoard() {
  const columns = useBoardStore((state) => state.columns);
  const cards = useBoardStore((state) => state.cards);
  const addCard = useBoardStore((state) => state.addCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const moveCard = useBoardStore((state) => state.moveCard);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [interactive, setInteractive] = useState(false);
  const lastOverId = useRef<string | null>(null);

  useEffect(() => {
    setInteractive(true);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeCard = activeId ? cards[activeId] : undefined;
  const activeColumn = activeId ? findColumn(activeId, columns) : undefined;
  const editingCard =
    editor.mode === "edit" ? cards[editor.cardId] : undefined;
  const deletingCard = pendingDelete ? cards[pendingDelete] : undefined;
  const createMeta =
    editor.mode === "create"
      ? COLUMNS.find((column) => column.id === editor.columnId)
      : undefined;

  function handleDragStart(event: DragStartEvent) {
    lastOverId.current = null;
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const activeKey = String(active.id);
    if (overId === lastOverId.current) return;
    const snapshot = useBoardStore.getState().columns;
    const from = findColumn(activeKey, snapshot);
    const to = findColumn(overId, snapshot);
    if (!from || !to || from === to) return;
    lastOverId.current = overId;
    moveCard(activeKey, overId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    lastOverId.current = null;
    if (!over) return;
    const activeKey = String(active.id);
    const overId = String(over.id);
    const snapshot = useBoardStore.getState().columns;
    const from = findColumn(activeKey, snapshot);
    const to = findColumn(overId, snapshot);
    if (!from || !to) return;
    if (from === to) {
      moveCard(activeKey, overId);
    }
  }

  const columnNodes = COLUMN_IDS.map((columnId) => (
    <KanbanColumn
      key={columnId}
      columnId={columnId}
      interactive={interactive}
      cards={columns[columnId]
        .map((id) => cards[id])
        .filter((card) => card != null)}
      onAdd={() => setEditor({ mode: "create", columnId })}
      onEdit={(cardId) => setEditor({ mode: "edit", cardId })}
      onDelete={setPendingDelete}
    />
  ));

  const boardRow = (
    <div className="flex min-h-0 min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:px-6 md:snap-none md:gap-4">
      {columnNodes}
    </div>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {interactive ? (
        <DndContext
          id="gyeol-board"
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveId(null);
            lastOverId.current = null;
          }}
        >
          {boardRow}
          <DragOverlay
            dropAnimation={{
              duration: 220,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {activeCard && activeColumn ? (
              <CardFace card={activeCard} columnId={activeColumn} overlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        boardRow
      )}

      <p className="px-4 pb-4 text-center text-xs text-faint sm:px-6">
        <span className="hint-mouse">카드를 잡아 다른 열로 옮기세요.</span>
        <span className="hint-touch">카드를 길게 눌러 다른 열로 옮기세요.</span>
      </p>

      <CardDialog
        open={editor.mode !== "closed"}
        onOpenChange={(open) => {
          if (!open) setEditor({ mode: "closed" });
        }}
        heading={editor.mode === "edit" ? "카드 수정" : "카드 추가"}
        description={
          editor.mode === "edit"
            ? "제목과 설명을 고친 뒤 저장하세요."
            : `${createMeta?.title ?? ""} 열에 새 카드를 넣습니다.`
        }
        submitLabel={editor.mode === "edit" ? "저장" : "추가"}
        initialTitle={editingCard?.title ?? ""}
        initialDescription={editingCard?.description ?? ""}
        onSubmit={(title, description) => {
          if (editor.mode === "create") {
            addCard(editor.columnId, title, description);
            toast("카드를 추가했습니다");
            return;
          }
          if (editor.mode === "edit") {
            updateCard(editor.cardId, title, description);
            toast("카드를 수정했습니다");
          }
        }}
      />

      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카드를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCard
                ? `「${deletingCard.title}」 카드가 보드에서 사라집니다. 이 작업은 되돌릴 수 없습니다.`
                : "이 카드가 보드에서 사라집니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) return;
                deleteCard(pendingDelete);
                toast("카드를 삭제했습니다");
                setPendingDelete(null);
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
