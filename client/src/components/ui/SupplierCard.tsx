import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, CheckCircle } from 'lucide-react';
import type { Supplier } from '../../types';
import Badge from './Badge';

const CATEGORY_COLORS: Record<string, string> = {
  'Fabrics': 'bg-blue-500',
  'Thread': 'bg-purple-500',
  'Accessories': 'bg-orange-500',
};

interface SupplierCardProps {
  supplier: Supplier;
  deliveryTime?: string;
}

export default function SupplierCard({ supplier, deliveryTime = '2–5 days' }: SupplierCardProps) {
  return (
    <Link to={`/suppliers/${supplier.id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        {/* Cover image */}
        <div className="relative h-40 bg-gradient-to-br from-pink-100 to-pink-200 overflow-hidden">
          {supplier.cover_url ? (
            <img src={supplier.cover_url} alt={supplier.company_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-bold text-pink-300 opacity-40">
                {supplier.company_name[0]}
              </span>
            </div>
          )}
          {supplier.is_verified && (
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
              <CheckCircle size={14} className="text-green-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-[#e2006a] transition-colors">
              {supplier.company_name}
            </h3>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-700">{supplier.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({supplier.total_reviews})</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {deliveryTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {supplier.location}
            </span>
          </div>

          {supplier.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {supplier.certifications.slice(0, 2).map(cert => (
                <Badge key={cert} label={cert} color="green" />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
