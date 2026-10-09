import { Check } from "lucide-react";
import { PROGRESS_STEPS } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

export function OrderProgress({ status }: { status: OrderStatus }) {
  const current = PROGRESS_STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="flex items-start">
      {PROGRESS_STEPS.map((step, index) => {
        const done = index <= current;

        return (
          <li
            key={step.status}
            className="relative flex flex-1 flex-col items-center text-center"
          >
            {index > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                  done ? "bg-ink" : "bg-black/10",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs",
                done ? "bg-ink text-white" : "bg-surface text-black/40",
              )}
            >
              {done ? <Check size={16} /> : index + 1}
            </span>
            <span className={cn("mt-2 text-xs", done ? "text-black" : "text-black/40")}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}