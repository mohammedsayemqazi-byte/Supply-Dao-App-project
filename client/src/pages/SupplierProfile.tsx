import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Supplier, Material, MaterialCategory } from '../types';
import MaterialCard from '../components/ui/MaterialCard';
import Badge from '../components/ui/Badge';

const CATEGORY_TABS: { value: 'all' | MaterialCategory; label: string }[] = [
  { value: 'all', label: 'All Materials' },
  { value: 'fabric_natural', label: 'Natural Fabrics' },
  { value: 'fabric_synthetic', label: 'Synthetic Fabrics' },
  { value: 'fabric_woven', label: 'Woven Fabrics' },
  { value: 'thread', label: 'Threads' },
  { value: 'accessories', label: 'Accessories' },
];

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | MaterialCategory>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: m }] = await Promise.all([
        supabase.from('suppliers').select('*, profile:profiles(*)').eq('id', id!).single(),
        supabase.from('materials').select('*').eq('supplier_id', id!).eq('is_active', true).order('category'),
      ]);
      setSupplier(s);
      setMaterials(m ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const filtered = activeCategory === 'all'
    ? materials
    : materials.filter(m => m.category === activeCategory);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
        <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>
    );
  }

  if (!supplier) return <div className="text-center py-16 text-gray-400">Supplier not found.</div>;

  return (
    <div>
      {/* Cover */}
      <div className="h-48 bg-gradient-to-br from-pink-200 to-pink-400 rounded-2xl relative overflow-hidden mb-4">
        {supplier.cover_url && (
          <img src={supplier.cover_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{supplier.company_name}</h1>
            {supplier.is_verified && <CheckCircle size={18} className="text-green-400" />}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-white/80">
            <span className="flex items-center gap-1"><MapPin size={12} />{supplier.location}</span>
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              {supplier.rating.toFixed(1)} ({supplier.total_reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {supplier.capacity_per_month && (
            <span className="flex items-center gap-1.5"><Package size={14} className="text-[#e2006a]" />Capacity: {supplier.capacity_per_month}</span>
          )}
          {supplier.description && (
            <p className="text-gray-500 text-sm">{supplier.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {supplier.certifications.map(c => <Badge key={c} label={c} color="green" />)}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {CATEGORY_TABS.filter(t =>
          t.value === 'all' || materials.some(m => m.category === t.value)
        ).map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`shrink-0 text-sm px-4 py-1.5 rounded-full border transition-all ${
              activeCategory === tab.value
                ? 'bg-[#e2006a] text-white border-[#e2006a]'
                : 'border-gray-200 text-gray-600 hover:border-[#e2006a] hover:text-[#e2006a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No materials in this category.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(m => <MaterialCard key={m.id} material={m} />)}
        </div>
      )}
    </div>
  );
}
