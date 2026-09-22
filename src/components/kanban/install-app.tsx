import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_BOARD_TITLE, useBoardStore } from "@/lib/board-store";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches
  );
}

export function InstallApp() {
  const boardTitle = useBoardStore((state) => state.boardTitle);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      const name = useBoardStore.getState().boardTitle || DEFAULT_BOARD_TITLE;
      toast(`시작 메뉴에 ${name} 아이콘이 생겼습니다`);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleInstall() {
    if (!deferred) {
      setHelpOpen(true);
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferred(null);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => void handleInstall()}
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Windows에 설치</span>
        <span className="sm:hidden">설치</span>
      </Button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>바탕화면 바로가기</DialogTitle>
            <DialogDescription>
              받은 폴더로는 바로가기가 생기지 않습니다. Windows의 Edge나 Chrome에서
              이 보드를 열 다음 만드세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-normal text-ink">
            <div>
              <p className="font-medium">Chrome</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-muted">
                <li>오른쪽 위 ⋮ → 저장 및 공유 → 바로가기 만들기</li>
                <li>
                  이름은 <span className="text-ink">{boardTitle}</span>,{" "}
                  <span className="text-ink">창으로 열기</span>에 체크한 뒤 만들기
                </li>
              </ol>
            </div>
            <div>
              <p className="font-medium">Edge</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-muted">
                <li>오른쪽 위 ⋯ → 앱 → 이 사이트를 앱으로 설치</li>
                <li>
                  <span className="text-ink">바탕 화면에 바로 가기 만들기</span>에
                  체크한 뒤 설치
                </li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setHelpOpen(false)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
