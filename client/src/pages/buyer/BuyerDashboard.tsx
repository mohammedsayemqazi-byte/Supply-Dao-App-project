import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, CheckCircle, XCircle, Truck, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Booking, BookingStatus } from '../../types';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<BookingStatus, { color: string; icon: React.ReactNode }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
  confirmed: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={12} /> },
  processing: { color: 'bg-purple-100 text-purple-700', icon: <Package size={12} /> },
  dispatched: { color: 'bg-orange-100 text-orange-700', icon: <Truck size={12} /> },
  delivered: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  cancelled: { color: 'bg-red-100 text-red-600', icon: <XCircle size={12} /> },
};

export default function BuyerDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from('bookings')
        .select('*, supplier:suppliers(company_name, location), items:booking_items(*, material:materials(name, unit))')
        .eq('buyer_id', profile.id)
        .order('created_at', { ascending: false });
      setBookings(data ?? []);
      setLoading(false);
    }
    load();
  }, [profile]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const active = bookings.filter(b => !['delivered', 'cancelled'].includes(b.status));

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('buyerDash.totalBookings'), value: bookings.length, color: 'text-gray-900' },
          { label: t('buyerDash.active'), value: active.length, color: 'text-blue-600' },
          { label: t('buyerDash.delivered'), value: bookings.filter(b => b.status === 'delivered').length, color: 'text-green-600' },
          { label: t('buyerDash.totalSpend'), value: `৳${bookings.reduce((s, b) => s + b.total_amount, 0).toLocaleString()}`, color: 'text-[#e2006a]' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {(['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition-all capitalize ${
              filter === s ? 'bg-[#e2006a] text-white border-[#e2006a]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {s === 'all' ? t('buyerDash.allBookings') : t(`status.${s}`)}
            {s !== 'all' && (
              <span className="ml-1 opacity-70">({bookings.filter(b => b.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">📦</p>
          <p className="font-medium">{t('buyerDash.noBookings')}</p>
          <Link to="/suppliers" className="mt-2 inline-block text-sm text-[#e2006a] hover:underline">{t('buyerDash.browseSuppliers')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => {
            const cfg = STATUS_CONFIG[booking.status];
            return (
              <Link key={booking.id} to={`/bookings/${booking.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                        {cfg.icon} {t(`status.${booking.status}`)}
                      </span>
                      <span className="text-xs text-gray-400">#{booking.id.slice(0, 8)}</span>
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{(booking.supplier as any)?.company_name ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('buyerDash.delivery', { date: format(new Date(booking.delivery_date), 'dd MMM yyyy'), count: booking.items?.length ?? 0 })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">৳{booking.total_amount.toLocaleString()}</p>
                    <ChevronRight size={16} className="text-gray-300 ml-auto mt-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
