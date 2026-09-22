import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,box-shadow,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:bg-accent/90",
        outline: "bg-paper text-ink shadow-card hover:shadow-card-hover",
        ghost: "bg-transparent text-muted hover:bg-surface hover:text-ink",
        danger: "bg-danger-soft text-danger hover:bg-danger hover:text-accent-fg",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-sm",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { Button, buttonVariants };
