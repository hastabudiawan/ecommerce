import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

export function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className={cn(
          "mt-2 w-full rounded-full border border-black/10 bg-surface px-5 py-3 outline-none placeholder:text-black/40 focus:border-black/30",
          error && "border-sale",
          className,
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-sm text-sale">{error}</span>}
    </label>
  );
}