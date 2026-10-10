import { cn } from "@/lib/utils";

interface StatusTabsProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function StatusTabs({ options, value, onChange }: StatusTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm",
            option.value === value
              ? "bg-ink text-white"
              : "bg-surface text-black/60 hover:text-black",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}