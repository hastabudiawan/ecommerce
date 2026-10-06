import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "outline";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-full px-8 py-4 text-sm font-medium transition-opacity disabled:opacity-50",
        variant === "primary" && "bg-ink text-white hover:opacity-90",
        variant === "outline" && "border border-black/20 bg-white hover:bg-surface",
        className,
      )}
      {...props}
    />
  );
}