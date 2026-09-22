import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "focus-ring h-11 w-full rounded-md bg-paper px-3 text-base text-ink shadow-card outline-none transition-[box-shadow] duration-150",
        "placeholder:text-faint disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
