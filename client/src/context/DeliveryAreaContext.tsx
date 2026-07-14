import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export const DELIVERY_AREAS = ['Dhaka', 'Gazipur', 'Chittagong'] as const;
export type DeliveryArea = typeof DELIVERY_AREAS[number];

interface DeliveryAreaContextValue {
  area: DeliveryArea | null;
  setArea: (area: DeliveryArea | null) => void;
}

const DeliveryAreaContext = createContext<DeliveryAreaContextValue>({
  area: null,
  setArea: () => {},
});

export function DeliveryAreaProvider({ children }: { children: ReactNode }) {
  const [area, setArea] = useState<DeliveryArea | null>(null);
  return (
    <DeliveryAreaContext.Provider value={{ area, setArea }}>
      {children}
    </DeliveryAreaContext.Provider>
  );
}

export const useDeliveryArea = () => useContext(DeliveryAreaContext);
