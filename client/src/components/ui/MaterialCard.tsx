import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import type { Material } from '../../types';
import { useCart } from '../../context/CartContext';
import Badge from './Badge';

const CATEGORY_LABELS: Record<string, string> = {
  fabric_natural: 'Natural Fabric',
  fabric_synthetic: 'Synthetic Fabric',
  fabric_woven: 'Woven Fabric',
  thread: 'Thread',
  accessories: 'Accessories',
};

const CATEGORY_COLORS: Record<string, 'blue' | 'pink' | 'green' | 'yellow' | 'gray'> = {
  fabric_natural: 'green',
  fabric_synthetic: 'blue',
  fabric_woven: 'yellow',
  thread: 'pink',
  accessories: 'gray',
};

interface MaterialCardProps {
  material: Material;
}

export default function MaterialCard({ material }: MaterialCardProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(material.minimum_order_qty);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(material, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const inStock = material.stock_available > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {material.image_url ? (
          <img src={material.image_url} alt={material.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            🧵
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-500">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div>
          <Badge label={CATEGORY_LABELS[material.category]} color={CATEGORY_COLORS[material.category]} />
          <h4 className="font-semibold text-gray-900 text-sm mt-1">{material.name}</h4>
          {material.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{material.description}</p>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-0.5">
          <div>Lead time: <span className="font-medium text-gray-700">{material.lead_time_days} days</span></div>
          <div>MOQ: <span className="font-medium text-gray-700">{material.minimum_order_qty} {material.unit}</span></div>
          <div>Stock: <span className="font-medium text-gray-700">{material.stock_available} {material.unit}</span></div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div>
            <span className="text-sm font-bold text-gray-900">৳{material.price_per_unit.toLocaleString()}</span>
            <span className="text-xs text-gray-400"> /{material.unit}</span>
          </div>

          {inStock && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQty(q => Math.max(material.minimum_order_qty, q - material.minimum_order_qty))}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#e2006a] hover:text-[#e2006a] transition-colors"
              >
                <Minus size={10} />
              </button>
              <span className="text-xs font-medium w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + material.minimum_order_qty)}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#e2006a] hover:text-[#e2006a] transition-colors"
              >
                <Plus size={10} />
              </button>
              <button
                onClick={handleAdd}
                className={`ml-1 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full font-medium transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-[#e2006a] text-white hover:bg-[#b8005a]'
                }`}
              >
                <ShoppingCart size={11} />
                {added ? 'Added!' : 'Add'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
