import { useEffect, useState, type FormEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";

type CardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: string;
  description: string;
  submitLabel: string;
  initialTitle?: string;
  initialDescription?: string;
  onSubmit: (title: string, description: string) => void;
};

export function CardDialog({
  open,
  onOpenChange,
  heading,
  description,
  submitLabel,
  initialTitle = "",
  initialDescription = "",
  onSubmit,
}: CardDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialDescription);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
    setBody(initialDescription);
  }, [open, initialTitle, initialDescription]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onSubmit(nextTitle, body.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="card-title">제목</Label>
              <Input
                id="card-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="무엇을 해야 하나요?"
                maxLength={120}
                required
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="card-description">설명</Label>
              <Textarea
                id="card-description"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="세부 내용을 적어 주세요. 비워 두어도 됩니다."
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
