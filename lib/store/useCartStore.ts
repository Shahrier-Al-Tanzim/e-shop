import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      addItem: (item) => {
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.id === item.id);

        if (existing) {
          // Cap stock limits
          if (existing.qty >= item.stock) return;
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          // Block adding out of stock listings
          if (item.stock <= 0) return;
          set({ items: [...currentItems, { ...item, qty: 1 }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      toggleDrawer: (open) =>
        set((state) => ({
          isDrawerOpen: open !== undefined ? open : !state.isDrawerOpen,
        })),
      getCartCount: () => {
        return get().items.reduce((acc, i) => acc + i.qty, 0);
      },
      getCartTotal: () => {
        return get().items.reduce((acc, i) => acc + i.price * i.qty, 0);
      },
    }),
    {
      name: "eshop-persistent-cart", // Persistent localStorage storage key
    }
  )
);
