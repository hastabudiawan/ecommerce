interface SaleToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SaleToggle({ checked, onChange }: SaleToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      Hanya produk diskon
    </label>
  );
}