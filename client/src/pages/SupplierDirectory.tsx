import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Supplier } from '../types';
import SupplierCard from '../components/ui/SupplierCard';
import { useDeliveryArea } from '../context/DeliveryAreaContext';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'fastest', label: 'Fastest Delivery' },
  { value: 'name', label: 'Name A–Z' },
];

export default function SupplierDirectory() {
  const { area } = useDeliveryArea();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase.from('suppliers').select('*, materials(name, category)');
      if (onlyVerified) q = q.eq('is_verified', true);
      if (sort === 'rating') q = q.order('rating', { ascending: false });
      else if (sort === 'name') q = q.order('company_name', { ascending: true });
      const { data } = await q;
      setSuppliers(data ?? []);
      setLoading(false);
    }
    load();
  }, [sort, onlyVerified]);

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      s.company_name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      (s.materials?.some(m => m.name.toLowerCase().includes(q)) ?? false);
    const matchesArea = !area || s.location.toLowerCase().includes(area.toLowerCase());
    return matchesSearch && matchesArea;
  });

  return (
    <div className="flex gap-6">
      {/* Sidebar Filters */}
      <aside className="w-56 shrink-0 hidden lg:block">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={15} className="text-[#e2006a]" />
            <h3 className="font-semibold text-sm text-gray-900">Filters</h3>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sort by</p>
            {SORT_OPTIONS.map(o => (
              <label key={o.value} className="flex items-center gap-2 py-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={o.value}
                  checked={sort === o.value}
                  onChange={() => setSort(o.value)}
                  className="accent-[#e2006a]"
                />
                <span className="text-sm text-gray-700">{o.label}</span>
              </label>
            ))}
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Options</p>
            <label className="flex items-center gap-2 py-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={e => setOnlyVerified(e.target.checked)}
                className="accent-[#e2006a]"
              />
              <span className="text-sm text-gray-700">Verified only</span>
            </label>
            <label className="flex items-center gap-2 py-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)}
                className="accent-[#e2006a]"
              />
              <span className="text-sm text-gray-700">Available today</span>
            </label>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 px-4 py-2.5 mb-5">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search suppliers, materials, or location..."
            className="flex-1 outline-none text-sm text-gray-700"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">
            {search ? `Results for "${search}"` : area ? `Suppliers in ${area}` : 'All Suppliers'}
          </h2>
          <span className="text-sm text-gray-400">{filtered.length} found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-medium">
              {search ? 'No suppliers match your search' : `No suppliers found in ${area}`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(s => <SupplierCard key={s.id} supplier={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
