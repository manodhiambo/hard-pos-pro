import { create } from 'zustand';
import { Product } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, unitPrice?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discountPercentage: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getDiscount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity, unitPrice) => {
    const items = get().items;
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            product,
            quantity,
            unitPrice: unitPrice || product.retailPrice,
            discountPercentage: 0,
          },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  updateDiscount: (productId, discountPercentage) => {
    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, discountPercentage } : item
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  },

  getDiscount: () => {
    return get().items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * item.discountPercentage) / 100;
    }, 0);
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const taxableAmount = subtotal - discount;
    
    return get().items.reduce((sum, item) => {
      if (!item.product.isTaxable) return sum;
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = (itemSubtotal * item.discountPercentage) / 100;
      const itemTaxable = itemSubtotal - itemDiscount;
      return sum + (itemTaxable * item.product.taxRate) / 100;
    }, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const tax = get().getTax();
    return subtotal - discount + tax;
  },
}));
