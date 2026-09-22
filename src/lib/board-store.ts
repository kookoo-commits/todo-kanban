import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_THEME, normalizeTheme, type BoardTheme } from "@/lib/board-theme";

export const COLUMN_IDS = ["todo", "doing", "done"] as const;
export type ColumnId = (typeof COLUMN_IDS)[number];

export type KanbanCard = {
  id: string;
  title: string;
  description: string;
};

export const COLUMNS: { id: ColumnId; title: string; hint: string }[] = [
  { id: "todo", title: "할 일", hint: "아직 손대지 않은 일" },
  { id: "doing", title: "진행 중", hint: "지금 다루는 일" },
  { id: "done", title: "완료", hint: "마무리된 일" },
];

export const DEFAULT_BOARD_TITLE = "TO DO";

const SEED_CARDS: Record<string, KanbanCard> = {
  "seed-1": {
    id: "seed-1",
    title: "주간 회고 질문 모으기",
    description: "금요일 오전에 쓸 질문 다섯 개를 짧게 정리합니다.",
  },
  "seed-2": {
    id: "seed-2",
    title: "읽기 목록 줄이기",
    description: "쌓아 둔 아티클을 이번 주에 읽을 세 편만 남깁니다.",
  },
  "seed-3": {
    id: "seed-3",
    title: "랜딩 카피 다듬기",
    description: "첫 문장을 더 짧게, 동사 중심으로 고치는 중입니다.",
  },
  "seed-4": {
    id: "seed-4",
    title: "보드 열 구성",
    description: "할 일, 진행 중, 완료 세 열로 일의 흐름을 나눴습니다.",
  },
};

const DEFAULT_COLUMNS: Record<ColumnId, string[]> = {
  todo: ["seed-1", "seed-2"],
  doing: ["seed-3"],
  done: ["seed-4"],
};

type BoardState = {
  boardTitle: string;
  theme: BoardTheme;
  columns: Record<ColumnId, string[]>;
  cards: Record<string, KanbanCard>;
  setBoardTitle: (title: string) => void;
  setTheme: (theme: Partial<BoardTheme>) => void;
  resetAppearance: () => void;
  addCard: (columnId: ColumnId, title: string, description: string) => string;
  updateCard: (id: string, title: string, description: string) => void;
  deleteCard: (id: string) => void;
  moveCard: (activeId: string, overId: string) => void;
};

export function findColumn(id: string, columns: Record<ColumnId, string[]>): ColumnId | undefined {
  if (id === "todo" || id === "doing" || id === "done") return id;
  return COLUMN_IDS.find((columnId) => columns[columnId].includes(id));
}

function sanitizeTitle(title: string) {
  const next = title.replace(/\s+/g, " ").trim().slice(0, 20);
  return next || DEFAULT_BOARD_TITLE;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boardTitle: DEFAULT_BOARD_TITLE,
      theme: DEFAULT_THEME,
      columns: DEFAULT_COLUMNS,
      cards: SEED_CARDS,
      setBoardTitle: (title) => {
        set({ boardTitle: sanitizeTitle(title) });
      },
      setTheme: (theme) => {
        set({ theme: normalizeTheme({ ...get().theme, ...theme }) });
      },
      resetAppearance: () => {
        set({ boardTitle: DEFAULT_BOARD_TITLE, theme: DEFAULT_THEME });
      },
      addCard: (columnId, title, description) => {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        set((state) => ({
          cards: { ...state.cards, [id]: { id, title, description } },
          columns: { ...state.columns, [columnId]: [...state.columns[columnId], id] },
        }));
        return id;
      },
      updateCard: (id, title, description) => {
        set((state) => {
          const current = state.cards[id];
          if (!current) return state;
          return { ...state, cards: { ...state.cards, [id]: { ...current, title, description } } };
        });
      },
      deleteCard: (id) => {
        set((state) => {
          const nextCards = { ...state.cards };
          delete nextCards[id];
          return {
            cards: nextCards,
            columns: {
              todo: state.columns.todo.filter((cardId) => cardId !== id),
              doing: state.columns.doing.filter((cardId) => cardId !== id),
              done: state.columns.done.filter((cardId) => cardId !== id),
            },
          };
        });
      },
      moveCard: (activeId, overId) => {
        const { columns } = get();
        if (activeId === overId) return;
        const from = findColumn(activeId, columns);
        const to = findColumn(overId, columns);
        if (!from || !to) return;
        if (from === to) {
          const items = columns[from];
          const oldIndex = items.indexOf(activeId);
          const newIndex = items.indexOf(overId);
          if (oldIndex < 0) return;
          if (newIndex < 0 || oldIndex === newIndex) return;
          set({ columns: { ...columns, [from]: arrayMove(items, oldIndex, newIndex) } });
          return;
        }
        const fromItems = columns[from].filter((id) => id !== activeId);
        const toItems = columns[to].filter((id) => id !== activeId);
        const overIndex = toItems.indexOf(overId);
        const insertAt = overIndex === -1 ? toItems.length : overIndex;
        const nextTo = [...toItems];
        nextTo.splice(insertAt, 0, activeId);
        set({ columns: { ...columns, [from]: fromItems, [to]: nextTo } });
      },
    }),
    {
      name: "gyeol-kanban-v1",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        boardTitle: state.boardTitle,
        theme: state.theme,
        columns: state.columns,
        cards: state.cards,
      }),
      migrate: (persisted, version) => {
        const state = persisted && typeof persisted === "object" ? (persisted as Record<string, unknown>) : {};
        const storedTitle = typeof state.boardTitle === "string" ? state.boardTitle.trim() : "";
        const boardTitle = sanitizeTitle(
          version < 4 && (storedTitle === "결" || storedTitle === "")
            ? DEFAULT_BOARD_TITLE
            : storedTitle || DEFAULT_BOARD_TITLE,
        );
        return {
          columns: state.columns ?? DEFAULT_COLUMNS,
          cards: state.cards ?? SEED_CARDS,
          boardTitle,
          theme: version < 3 ? DEFAULT_THEME : normalizeTheme(state.theme),
        };
      },
    },
  ),
);
