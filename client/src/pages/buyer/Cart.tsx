import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Calendar, MapPin, FileText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, total, supplierId } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address ?? '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateStr = minDate.toISOString().split('T')[0];

  async function handleBooking() {
    if (!deliveryDate || !deliveryAddress) { setError('Please fill in delivery date and address.'); return; }
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/bookings', {
        supplier_id: supplierId,
        delivery_date: deliveryDate,
        delivery_address: deliveryAddress,
        notes,
        items: items.map(i => ({
          material_id: i.material.id,
          quantity: i.quantity,
          price_per_unit: i.material.price_per_unit,
        })),
      });
      clearCart();
      navigate(`/bookings/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to place booking. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-3">🛒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-5">Browse suppliers and add materials to get started</p>
        <Link to="/suppliers" className="bg-[#e2006a] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#b8005a] transition-colors">
          Browse Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Your Requisition Basket</h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map(({ material, quantity }) => (
            <div key={material.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-start">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {material.image_url
                  ? <img src={material.image_url} alt={material.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🧵</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900">{material.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">৳{material.price_per_unit.toLocaleString()} / {material.unit}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(material.id, quantity - material.minimum_order_qty)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#e2006a] transition-colors">
                    <Minus size={10} />
                  </button>
                  <span className="text-sm font-medium">{quantity} {material.unit}</span>
                  <button onClick={() => updateQty(material.id, quantity + material.minimum_order_qty)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#e2006a] transition-colors">
                    <Plus size={10} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-900">৳{(material.price_per_unit * quantity).toLocaleString()}</p>
                <button onClick={() => removeItem(material.id)} className="mt-2 text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Summary */}
        <div className="lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar size={11} /> Delivery Date
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                  <MapPin size={11} /> Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Factory address..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                  <FileText size={11} /> Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Colour specs, quality notes..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="space-y-2 text-sm">
              {items.map(({ material, quantity }) => (
                <div key={material.id} className="flex justify-between text-gray-600">
                  <span>{material.name} × {quantity}</span>
                  <span>৳{(material.price_per_unit * quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full mt-4 bg-[#e2006a] text-white font-semibold py-2.5 rounded-full hover:bg-[#b8005a] transition-colors disabled:opacity-60"
            >
              {loading ? 'Placing Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
