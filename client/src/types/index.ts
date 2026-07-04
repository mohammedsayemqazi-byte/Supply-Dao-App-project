export type UserRole = 'buyer' | 'supplier' | 'agent' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  profile_id: string;
  company_name: string;
  description: string | null;
  location: string;
  certifications: string[];
  capacity_per_month: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  logo_url: string | null;
  cover_url: string | null;
  created_at: string;
  profile?: Profile;
}

export type MaterialCategory =
  | 'fabric_natural'
  | 'fabric_synthetic'
  | 'fabric_woven'
  | 'thread'
  | 'accessories';

export interface Material {
  id: string;
  supplier_id: string;
  name: string;
  category: MaterialCategory;
  description: string | null;
  unit: string;
  price_per_unit: number;
  minimum_order_qty: number;
  stock_available: number;
  lead_time_days: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  supplier?: Supplier;
}

export interface AvailabilitySlot {
  id: string;
  supplier_id: string;
  date: string;
  is_available: boolean;
  max_orders: number;
  current_orders: number;
  notes: string | null;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface BookingItem {
  id: string;
  booking_id: string;
  material_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  material?: Material;
}

export interface Booking {
  id: string;
  buyer_id: string;
  supplier_id: string;
  delivery_date: string;
  status: BookingStatus;
  delivery_address: string;
  notes: string | null;
  total_amount: number;
  created_at: string;
  items?: BookingItem[];
  supplier?: Supplier;
  buyer?: Profile;
}

export interface CartItem {
  material: Material;
  quantity: number;
}
