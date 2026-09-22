import { Palette } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRIMARY_THEMES,
  THEME_PRESETS,
  themesMatch,
  type BoardTheme,
} from "@/lib/board-theme";
import { DEFAULT_BOARD_TITLE, useBoardStore } from "@/lib/board-store";
import { cn } from "@/lib/utils";

const COLOR_FIELDS: { key: keyof BoardTheme; label: string; hint: string }[] = [
  { key: "canvas", label: "배경", hint: "보드 전체" },
  { key: "todo", label: "할 일", hint: "열 색" },
  { key: "doing", label: "진행 중", hint: "열 색" },
  { key: "done", label: "완료", hint: "열 색" },
  { key: "paper", label: "카드", hint: "메모 종이" },
  { key: "ink", label: "글자", hint: "메모 글씨" },
];

export function ThemeSwitch() {
  const theme = useBoardStore((state) => state.theme);
  const setTheme = useBoardStore((state) => state.setTheme);

  return (
    <div className="theme-switch" role="group" aria-label="테마">
      {PRIMARY_THEMES.map((preset) => {
        const selected = themesMatch(theme, preset.theme);
        return (
          <button
            key={preset.id}
            type="button"
            className="pressable focus-ring"
            aria-pressed={selected}
            onClick={() => setTheme(preset.theme)}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

export function AppearanceButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="색과 제목 바꾸기"
        className="shrink-0"
        onClick={() => setOpen(true)}
      >
        <Palette className="size-4" />
      </Button>
      <AppearanceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function AppearanceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const boardTitle = useBoardStore((state) => state.boardTitle);
  const theme = useBoardStore((state) => state.theme);
  const setBoardTitle = useBoardStore((state) => state.setBoardTitle);
  const setTheme = useBoardStore((state) => state.setTheme);
  const resetAppearance = useBoardStore((state) => state.resetAppearance);
  const [titleDraft, setTitleDraft] = useState(boardTitle);

  useEffect(() => {
    if (open) setTitleDraft(boardTitle);
  }, [open, boardTitle]);

  function commitTitle() {
    const next = titleDraft.trim() || DEFAULT_BOARD_TITLE;
    setTitleDraft(next);
    if (next !== boardTitle) setBoardTitle(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="appearance-panel">
        <DialogHeader>
          <DialogTitle>보드 모습</DialogTitle>
          <DialogDescription>
            테마를 고르거나 색을 직접 바꾸면 이 브라우저에 남습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="board-title">보드 제목</Label>
            <Input
              id="board-title"
              value={titleDraft}
              maxLength={20}
              autoComplete="off"
              onChange={(event) => {
                const value = event.target.value;
                setTitleDraft(value);
                const next = value.replace(/\s+/g, " ").trim().slice(0, 20);
                if (next) setBoardTitle(next);
              }}
              onBlur={commitTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitTitle();
                }
              }}
            />
          </div>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-ink">테마</legend>
            <div className="grid grid-cols-2 gap-2">
              {THEME_PRESETS.map((preset) => {
                const selected = themesMatch(theme, preset.theme);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      "pressable focus-ring flex items-center gap-3 rounded-md px-3 py-3 text-left",
                      selected ? "shadow-focus" : "shadow-card hover:shadow-card-hover",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setTheme(preset.theme)}
                    aria-pressed={selected}
                    aria-label={`${preset.label} 테마`}
                  >
                    <span
                      className="preset-chip"
                      style={{
                        background: `linear-gradient(135deg, ${preset.theme.canvas} 0 40%, ${preset.theme.todo} 40% 60%, ${preset.theme.doing} 60% 80%, ${preset.theme.done} 80% 100%)`,
                      }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {preset.label}
                      </span>
                      <span className="block text-xs text-muted">{preset.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-3">
            {COLOR_FIELDS.map((field) => (
              <ColorField
                key={field.key}
                id={`theme-${field.key}`}
                label={field.label}
                hint={field.hint}
                value={theme[field.key]}
                onChange={(value) => setTheme({ [field.key]: value })}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              resetAppearance();
              setTitleDraft(DEFAULT_BOARD_TITLE);
              toast("처음 색과 제목으로 되돌렸습니다");
            }}
          >
            처음처럼
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ColorField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <span className="tabular-nums text-xs text-muted">{value}</span>
      <input
        id={id}
        type="color"
        className="color-swatch"
        value={value}
        aria-label={`${label} 색`}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
