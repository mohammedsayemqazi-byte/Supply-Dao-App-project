import { createContext, useContext, useState, ReactNode } from 'react';
import type { CartItem, Material } from '../types';

interface CartContextValue {
  items: CartItem[];
  addItem: (material: Material, quantity: number) => void;
  removeItem: (materialId: string) => void;
  updateQty: (materialId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  supplierId: string | null;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  total: 0,
  supplierId: null,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const supplierId = items.length > 0 ? items[0].material.supplier_id : null;

  function addItem(material: Material, quantity: number) {
    // Enforce single-supplier cart
    if (supplierId && material.supplier_id !== supplierId) {
      if (!window.confirm('Your cart has items from another supplier. Clear it and add this item?')) return;
      setItems([{ material, quantity }]);
      return;
    }
    setItems(prev => {
      const existing = prev.find(i => i.material.id === material.id);
      if (existing) {
        return prev.map(i =>
          i.material.id === material.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { material, quantity }];
    });
  }

  function removeItem(materialId: string) {
    setItems(prev => prev.filter(i => i.material.id !== materialId));
  }

  function updateQty(materialId: string, quantity: number) {
    if (quantity <= 0) { removeItem(materialId); return; }
    setItems(prev => prev.map(i =>
      i.material.id === materialId ? { ...i, quantity } : i
    ));
  }

  function clearCart() { setItems([]); }

  const total = items.reduce((sum, i) => sum + i.material.price_per_unit * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, supplierId }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
