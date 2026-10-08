import type { CartItemDto } from "@/types/api";

export interface StoreGroup {
  storeId: number | null;
  storeName: string;
  items: CartItemDto[];
  subtotal: number;
}

export function groupByStore(items: CartItemDto[]): StoreGroup[] {
  const map = new Map<number | null, StoreGroup>();

  for (const item of items) {
    let group = map.get(item.storeId);
    if (!group) {
      group = {
        storeId: item.storeId,
        storeName: item.storeName ?? "Platform",
        items: [],
        subtotal: 0,
      };
      map.set(item.storeId, group);
    }
    group.items.push(item);
    group.subtotal += item.subtotal;
  }

  return Array.from(map.values());
}