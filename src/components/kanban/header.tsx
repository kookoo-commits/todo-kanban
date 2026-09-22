import { useEffect, useRef, useState } from "react";
import { DEFAULT_BOARD_TITLE, COLUMNS, useBoardStore } from "@/lib/board-store";
import { AppearanceButton, ThemeSwitch } from "./appearance";
import { InstallApp } from "./install-app";

function todayLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

export function BoardHeader() {
  const columns = useBoardStore((state) => state.columns);
  const total = COLUMNS.reduce(
    (sum, column) => sum + columns[column.id].length,
    0,
  );
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(todayLabel());
  }, []);

  return (
    <header className="flex shrink-0 items-end justify-between gap-4 px-4 pt-5 pb-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-widest text-on-canvas-muted">
          칸반 보드
        </p>
        <BoardTitle />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <AppearanceButton />
          <InstallApp />
        </div>
        <div className="text-right">
          <p className="text-sm text-on-canvas-muted">{today || "\u00a0"}</p>
          <p className="mt-1 text-sm text-on-canvas">
            카드 <span className="tabular-nums font-medium">{total}</span>
          </p>
        </div>
      </div>
    </header>
  );
}

function BoardTitle() {
  const title = useBoardStore((state) => state.boardTitle);
  const setBoardTitle = useBoardStore((state) => state.setBoardTitle);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(title);
  }, [editing, title]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    setBoardTitle(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="title-edit focus-ring"
        value={draft}
        maxLength={20}
        aria-label="보드 제목"
        autoComplete="off"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
          if (event.key === "Escape") {
            setDraft(title);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="title-edit pressable text-left"
      onClick={() => {
        setDraft(title);
        setEditing(true);
      }}
      aria-label="보드 제목 수정"
    >
      {title || DEFAULT_BOARD_TITLE}
    </button>
  );
}
