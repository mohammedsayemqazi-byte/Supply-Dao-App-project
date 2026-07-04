import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, Truck, Plus, Edit3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Booking, Material, BookingStatus } from '../../types';
import { format } from 'date-fns';
import api from '../../lib/api';

const STATUS_CONFIG: Record<BookingStatus, { label: string; next?: BookingStatus; nextLabel?: string; color: string }> = {
  pending: { label: 'Pending', next: 'confirmed', nextLabel: 'Confirm', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', next: 'processing', nextLabel: 'Start Processing', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', next: 'dispatched', nextLabel: 'Mark Dispatched', color: 'bg-purple-100 text-purple-700' },
  dispatched: { label: 'Dispatched', next: 'delivered', nextLabel: 'Mark Delivered', color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
};

export default function SupplierDashboard() {
  const { profile } = useAuth();
  const [supplierInfo, setSupplierInfo] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data: supplier } = await supabase.from('suppliers').select('*').eq('profile_id', profile.id).single();
      if (!supplier) { setLoading(false); return; }
      setSupplierInfo(supplier);

      const [{ data: b }, { data: m }] = await Promise.all([
        supabase.from('bookings').select('*, buyer:profiles(full_name, company_name), items:booking_items(*, material:materials(name, unit))')
          .eq('supplier_id', supplier.id).order('created_at', { ascending: false }),
        supabase.from('materials').select('*').eq('supplier_id', supplier.id),
      ]);
      setBookings(b ?? []);
      setMaterials(m ?? []);
      setLoading(false);
    }
    load();
  }, [profile]);

  async function advanceStatus(bookingId: string, nextStatus: BookingStatus) {
    await api.patch(`/bookings/${bookingId}/status`, { status: nextStatus });
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b));
  }

  async function updateStock(materialId: string, stock: number) {
    await supabase.from('materials').update({ stock_available: stock }).eq('id', materialId);
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, stock_available: stock } : m));
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const active = bookings.filter(b => ['confirmed', 'processing', 'dispatched'].includes(b.status));

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'New Orders', value: pending.length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Active Orders', value: active.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Materials Listed', value: materials.length, color: 'text-[#e2006a]', bg: 'bg-pink-50' },
          { label: 'Total Revenue', value: `৳${bookings.filter(b => b.status === 'delivered').reduce((s, b) => s + b.total_amount, 0).toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['orders', 'inventory'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              activeTab === t ? 'bg-[#e2006a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {t === 'orders' ? 'Incoming Orders' : 'Inventory'}
          </button>
        ))}
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">📬</p>
              <p>No orders yet</p>
            </div>
          ) : (
            bookings.map(booking => {
              const cfg = STATUS_CONFIG[booking.status];
              return (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-gray-400">#{booking.id.slice(0, 8)}</span>
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{(booking.buyer as any)?.company_name || (booking.buyer as any)?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Delivery: {format(new Date(booking.delivery_date), 'dd MMM yyyy')} · {booking.items?.length} item(s)
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{booking.delivery_address}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-gray-900">৳{booking.total_amount.toLocaleString()}</p>
                      {cfg.next && (
                        <button
                          onClick={() => advanceStatus(booking.id, cfg.next!)}
                          className="text-xs bg-[#e2006a] text-white px-3 py-1.5 rounded-full hover:bg-[#b8005a] transition-colors"
                        >
                          {cfg.nextLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-400">{m.unit} · ৳{m.price_per_unit.toLocaleString()}/unit · Lead: {m.lead_time_days}d</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Stock:</span>
                <input
                  type="number"
                  defaultValue={m.stock_available}
                  onBlur={e => updateStock(m.id, Number(e.target.value))}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-[#e2006a]"
                />
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {m.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
