import { defineStore } from 'pinia';

export interface LocalCartItem {
  targetType: string;
  targetId: number;
  quantity: number;
  [key: string]: unknown;
}

/** 旅游详情页的临时购物车状态；结算仍以服务端购物车接口为准。 */
export const useCartStore = defineStore('travel-cart', {
  state: () => ({ items: [] as LocalCartItem[] }),
  actions: {
    addItem(item: LocalCartItem) {
      const existing = this.items.find(
        current => current.targetType === item.targetType && current.targetId === item.targetId
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        this.items.push({ ...item });
      }
    },
  },
});
