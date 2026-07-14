-- ============================================================
-- Supply Buddy — Additional suppliers for material variety
-- Adds 3 more suppliers (Dhaka, Gazipur, Chittagong) covering
-- cotton, silk, polyester, nylon, buttons, and zippers so every
-- material category has more than one supplier option.
-- Uses the same dev supplier profile as supabase_seed.sql —
-- replace SUPPLIER_USER_UUID_HERE with a real auth.users UUID
-- before running. Dev/demo only — do not run in production.
-- ============================================================

insert into suppliers (
  profile_id,
  company_name, description, location,
  certifications, capacity_per_month,
  rating, total_reviews, is_verified
) values
  (
    'SUPPLIER_USER_UUID_HERE',
    'Chittagong Fabric House',
    'Cotton and polyester fabric mill serving the southern export hubs',
    'Chittagong, Bangladesh',
    array['OEKO-TEX'], '250,000 meters/month',
    4.5, 140, true
  ),
  (
    'SUPPLIER_USER_UUID_HERE',
    'Gazipur Silk & Nylon Traders',
    'Specialist in silk and nylon fabrics for premium garment lines',
    'Gazipur, Bangladesh',
    array['ISO 9001'], '150,000 meters/month',
    4.3, 88, true
  ),
  (
    'SUPPLIER_USER_UUID_HERE',
    'Dhaka Trims & Accessories',
    'Buttons, zippers and trims manufacturer based in Dhaka',
    'Dhaka, Bangladesh',
    array['WRAP'], '5,000,000 pcs/month',
    4.6, 165, true
  );

insert into materials (
  supplier_id, name, category, description,
  unit, price_per_unit, minimum_order_qty,
  stock_available, lead_time_days, is_active
)
select
  s.id,
  m.name, m.category::material_category, m.description,
  m.unit, m.price_per_unit, m.minimum_order_qty,
  m.stock_available, m.lead_time_days, true
from (values
  ('Chittagong Fabric House', 'Cotton Voile Fabric',       'fabric_natural',   'Lightweight 100% cotton voile',        'meter', 70.00,  300,  30000, 4),
  ('Chittagong Fabric House', 'Polyester Twill Fabric',    'fabric_synthetic', '100% polyester twill weave',           'meter', 60.00,  400,  35000, 5),
  ('Gazipur Silk & Nylon Traders', 'Silk Chiffon Fabric',  'fabric_natural',   'Sheer silk chiffon, lightweight drape', 'meter', 280.00, 100,  6000,  6),
  ('Gazipur Silk & Nylon Traders', 'Nylon Taffeta Fabric', 'fabric_synthetic', 'Crisp nylon taffeta, water resistant', 'meter', 90.00,  300,  15000, 4),
  ('Dhaka Trims & Accessories', 'Metal Buttons 2-hole',    'accessories',      '18mm, brushed nickel finish',          'gross', 220.00, 40,   18000, 3),
  ('Dhaka Trims & Accessories', 'Nylon Coil Zippers',      'accessories',      '15cm nylon coil, various colours',     'piece', 9.00,   1500, 100000, 2)
) as m(company_name, name, category, description, unit, price_per_unit, minimum_order_qty, stock_available, lead_time_days)
join suppliers s on s.company_name = m.company_name;
