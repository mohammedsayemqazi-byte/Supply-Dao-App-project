-- ============================================================
-- Supply Buddy — Part 2: Seed / Test Data
-- ⚠️  DO NOT run this in production.
-- ============================================================
--
-- How to use:
--   1. Sign up as a supplier user via the app UI (or Supabase
--      Auth dashboard → Add user).
--   2. Copy that user's UUID from auth.users (Supabase dashboard
--      → Authentication → Users).
--   3. Replace each SUPPLIER_USER_UUID_HERE placeholder below
--      with a real UUID that already exists in auth.users.
--   4. Run this script in Supabase SQL Editor.
--
-- If you want multiple suppliers, create one auth user per
-- supplier and use each user's UUID for the matching row.
-- ============================================================


-- ── Step 1: seed supplier profiles ──────────────────────────
-- Replace every placeholder UUID before running.

insert into suppliers (
  profile_id,
  company_name, description, location,
  certifications, capacity_per_month,
  rating, total_reviews, is_verified
) values
  (
    '444f7e33-d9b6-4f8f-a438-7d34ee5b0497',             -- supplier1@test.com
    'Dhaka Textile Mills',
    'Premium cotton and woven fabric supplier with 20+ years in RMG',
    'Dhaka, Bangladesh',
    array['OEKO-TEX', 'GOTS'], '500,000 meters/month',
    4.8, 320, true
  ),
  (
    '444f7e33-d9b6-4f8f-a438-7d34ee5b0497',             -- supplier1@test.com (can be same user for dev)
    'Bengal Threads Co.',
    'Specialist in spun polyester and cotton threads',
    'Gazipur, Bangladesh',
    array['ISO 9001'], '2,000,000 spools/month',
    4.6, 180, true
  ),
  (
    '444f7e33-d9b6-4f8f-a438-7d34ee5b0497',             -- supplier1@test.com
    'Narsingdi Fabrics Ltd.',
    'Woven and synthetic fabric manufacturer',
    'Narsingdi, Bangladesh',
    array['OEKO-TEX'], '300,000 meters/month',
    4.4, 95, true
  ),
  (
    '444f7e33-d9b6-4f8f-a438-7d34ee5b0497',             -- supplier1@test.com
    'RMG Accessories BD',
    'Buttons, zippers, fasteners and trims',
    'Chittagong, Bangladesh',
    array['ISO 9001', 'WRAP'], '10,000,000 pcs/month',
    4.7, 210, true
  );


-- ── Step 2: seed materials ───────────────────────────────────
-- Uses a subquery to look up supplier IDs by company name,
-- so you do not need to hardcode UUIDs a second time.

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
  -- Dhaka Textile Mills
  ('Dhaka Textile Mills', 'Premium Cotton Fabric',  'fabric_natural',    '100% combed cotton, 160 GSM',        'meter', 85.00,  500,  50000, 5),
  ('Dhaka Textile Mills', 'Silk Blend Fabric',      'fabric_natural',    '70% silk 30% cotton, smooth finish', 'meter', 320.00, 100,  8000,  7),
  ('Dhaka Textile Mills', 'Plain Woven Cotton',     'fabric_woven',      'Plain weave, 140 GSM',               'meter', 65.00,  1000, 80000, 3),
  -- Bengal Threads Co.
  ('Bengal Threads Co.', 'Spun Polyester Thread',  'thread',            '100% spun polyester, 5000m spool',   'spool', 45.00,  200,  15000, 2),
  ('Bengal Threads Co.', '100% Cotton Thread',     'thread',            'Mercerised cotton, 3000m spool',     'spool', 60.00,  100,  9000,  3),
  -- Narsingdi Fabrics Ltd.
  ('Narsingdi Fabrics Ltd.', 'Polyester Fabric',   'fabric_synthetic',  '100% polyester, 180 GSM',            'meter', 55.00,  500,  40000, 4),
  ('Narsingdi Fabrics Ltd.', 'Nylon Ripstop',      'fabric_synthetic',  'Lightweight nylon ripstop',          'meter', 95.00,  300,  12000, 5),
  -- RMG Accessories BD
  ('RMG Accessories BD', 'Plastic Buttons 4-hole', 'accessories',       '15mm, assorted colours',             'gross', 180.00, 50,   25000, 2),
  ('RMG Accessories BD', 'Metal Zippers YKK-type', 'accessories',       '20cm closed-end, black/silver',      'piece', 12.00,  1000, 80000, 3),
  ('RMG Accessories BD', 'Elastic Waistband',      'accessories',       '3cm wide, 150m roll',                'roll',  550.00, 20,   3000,  4)
) as m(company_name, name, category, description, unit, price_per_unit, minimum_order_qty, stock_available, lead_time_days)
join suppliers s on s.company_name = m.company_name;
