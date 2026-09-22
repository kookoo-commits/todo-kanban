import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "focus-ring min-h-28 w-full resize-y rounded-md bg-paper px-3 py-2.5 text-base leading-normal text-ink shadow-card outline-none transition-[box-shadow] duration-150",
        "placeholder:text-faint disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
