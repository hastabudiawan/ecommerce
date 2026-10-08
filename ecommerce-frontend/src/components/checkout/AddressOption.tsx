import { cn } from "@/lib/utils";
import type { Address } from "@/types/api";

interface AddressOptionProps {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}

export function AddressOption({ address, selected, onSelect }: AddressOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition",
        selected ? "border-ink bg-surface" : "border-black/10 hover:border-black/30",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{address.recipientName}</span>
        {address.isDefault && (
          <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">
            Utama
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-black/60">{address.phone}</p>
      <p className="mt-1 text-sm text-black/60">
        {address.addressLine}, {address.city}, {address.province} {address.postalCode}
      </p>
    </button>
  );
}