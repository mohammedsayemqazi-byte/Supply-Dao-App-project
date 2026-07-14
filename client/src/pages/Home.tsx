import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Supplier } from '../types';
import SupplierCard from '../components/ui/SupplierCard';
import { useAuth } from '../context/AuthContext';
import { useDeliveryArea } from '../context/DeliveryAreaContext';

const MATERIAL_FILTERS = [
  { label: 'Cotton', emoji: '🌿' },
  { label: 'Silk', emoji: '✨' },
  { label: 'Polyester', emoji: '🔵' },
  { label: 'Nylon', emoji: '🟣' },
  { label: 'Threads', emoji: '🧵' },
  { label: 'Buttons', emoji: '🔘' },
  { label: 'Zippers', emoji: '🤐' },
];

export default function Home() {
  const { profile } = useAuth();
  const { area } = useDeliveryArea();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [featured, setFeatured] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuppliers() {
      setLoading(true);
      const { data } = await supabase
        .from('suppliers')
        .select('*, profile:profiles(full_name, email), materials(name, category)')
        .eq('is_verified', true)
        .order('rating', { ascending: false });
      if (data) {
        setFeatured(data.slice(0, 4));
        setSuppliers(data);
      }
      setLoading(false);
    }
    fetchSuppliers();
  }, []);

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      s.company_name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      (s.materials?.some(m => m.name.toLowerCase().includes(q)) ?? false);
    const matchesArea = !area || s.location.toLowerCase().includes(area.toLowerCase());
    return matchesSearch && matchesArea;
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#e2006a] to-[#ff4d9e] rounded-2xl p-8 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-1">
            {greeting()}{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-pink-100 mb-5">What raw materials are you sourcing today?</p>

          {/* Search */}
          <div className="bg-white rounded-full flex items-center px-4 py-2.5 gap-2 shadow-lg max-w-lg">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search suppliers, materials, fabrics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>

          {/* Material quick filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors">
              <RefreshCw size={14} />
            </button>
            {MATERIAL_FILTERS.map(f => (
              <button
                key={f.label}
                onClick={() => setSearch(f.label)}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded-full transition-colors flex items-center gap-1"
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
          <div className="w-40 h-40 rounded-full border-4 border-white" />
          <div className="w-24 h-24 rounded-full border-4 border-white absolute top-8 left-8" />
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900 text-sm">🎉 Book in advance & save 15%</p>
          <p className="text-xs text-gray-500 mt-0.5">On orders above ৳50,000 · Bulk discount applies</p>
        </div>
        <Link to="/suppliers" className="bg-[#e2006a] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#b8005a] transition-colors shrink-0">
          Book Now
        </Link>
      </div>

      {/* Featured Suppliers */}
      {featured.length > 0 && !search && !area && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-lg">Top Rated Suppliers</h2>
            <Link to="/suppliers" className="text-sm text-[#e2006a] flex items-center gap-0.5 hover:underline">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(s => <SupplierCard key={s.id} supplier={s} />)}
          </div>
        </section>
      )}

      {/* All / Filtered Suppliers */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-lg">
            {search ? `Results for "${search}"` : area ? `Suppliers in ${area}` : 'All Suppliers'}
          </h2>
          <span className="text-sm text-gray-400">{filtered.length} suppliers</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-medium">
              {search
                ? `No suppliers found for "${search}"`
                : area
                  ? `No suppliers found in ${area}`
                  : 'No suppliers found'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-2 text-sm text-[#e2006a] hover:underline">Clear search</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map(s => <SupplierCard key={s.id} supplier={s} />)}
          </div>
        )}
      </section>
    </div>
  );
}
