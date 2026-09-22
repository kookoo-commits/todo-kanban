import { createFileRoute } from "@tanstack/react-router";
import { BoardPage } from "@/components/kanban/board-page";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BoardPage />;
}
