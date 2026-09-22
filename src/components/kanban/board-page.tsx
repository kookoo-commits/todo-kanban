import { useEffect, useLayoutEffect } from "react";
import { applyBoardTheme } from "@/lib/board-theme";
import { useBoardStore } from "@/lib/board-store";
import { KanbanBoard } from "./board";
import { BoardHeader } from "./header";

export function BoardPage() {
  const theme = useBoardStore((state) => state.theme);
  const boardTitle = useBoardStore((state) => state.boardTitle);

  useEffect(() => {
    void useBoardStore.persist.rehydrate();
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  useLayoutEffect(() => {
    applyBoardTheme(theme, boardTitle);
  }, [theme, boardTitle]);

  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-canvas text-ink">
      <BoardHeader />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <KanbanBoard />
      </main>
    </div>
  );
}
