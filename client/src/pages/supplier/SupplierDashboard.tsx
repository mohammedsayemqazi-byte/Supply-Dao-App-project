import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Booking, Material, BookingStatus } from '../../types';
import { format } from 'date-fns';
import api from '../../lib/api';

const STATUS_CONFIG: Record<BookingStatus, { next?: BookingStatus; color: string }> = {
  pending: { next: 'confirmed', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { next: 'processing', color: 'bg-blue-100 text-blue-700' },
  processing: { next: 'dispatched', color: 'bg-purple-100 text-purple-700' },
  dispatched: { next: 'delivered', color: 'bg-orange-100 text-orange-700' },
  delivered: { color: 'bg-green-100 text-green-700' },
  cancelled: { color: 'bg-red-100 text-red-600' },
};

export default function SupplierDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [, setSupplierInfo] = useState<any>(null);
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
          { label: t('supplierDash.newOrders'), value: pending.length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: t('supplierDash.activeOrders'), value: active.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('supplierDash.materialsListed'), value: materials.length, color: 'text-[#e2006a]', bg: 'bg-pink-50' },
          { label: t('supplierDash.totalRevenue'), value: `৳${bookings.filter(b => b.status === 'delivered').reduce((s, b) => s + b.total_amount, 0).toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['orders', 'inventory'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-[#e2006a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {tab === 'orders' ? t('supplierDash.incomingOrders') : t('supplierDash.inventory')}
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
              <p>{t('supplierDash.noOrders')}</p>
            </div>
          ) : (
            bookings.map(booking => {
              const cfg = STATUS_CONFIG[booking.status];
              return (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{t(`status.${booking.status}`)}</span>
                        <span className="text-xs text-gray-400">#{booking.id.slice(0, 8)}</span>
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{(booking.buyer as any)?.company_name || (booking.buyer as any)?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('supplierDash.delivery', { date: format(new Date(booking.delivery_date), 'dd MMM yyyy'), count: booking.items?.length ?? 0 })}
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
                          {t(`status.next.${cfg.next}`)}
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
                <span className="text-xs text-gray-500">{t('supplierDash.stock')}</span>
                <input
                  type="number"
                  defaultValue={m.stock_available}
                  onBlur={e => updateStock(m.id, Number(e.target.value))}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-[#e2006a]"
                />
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {m.is_active ? t('supplierDash.active') : t('supplierDash.inactive')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
