const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// List materials (with optional supplier filter)
router.get('/', async (req, res) => {
  const { supplier_id, category } = req.query;
  let q = supabase.from('materials').select('*, supplier:suppliers(company_name, location)').eq('is_active', true);
  if (supplier_id) q = q.eq('supplier_id', supplier_id);
  if (category) q = q.eq('category', category);
  const { data, error } = await q.order('name');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Add material (supplier only)
router.post('/', requireAuth, requireRole('supplier'), async (req, res) => {
  const { supplier_id, name, category, description, unit, price_per_unit, minimum_order_qty, stock_available, lead_time_days } = req.body;

  if (!name || !category || !unit || !price_per_unit || !minimum_order_qty) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const { data, error } = await supabase.from('materials')
    .insert({ supplier_id, name, category, description, unit, price_per_unit, minimum_order_qty, stock_available: stock_available ?? 0, lead_time_days: lead_time_days ?? 7, is_active: true })
    .select().single();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

// Update material
router.patch('/:id', requireAuth, requireRole('supplier', 'admin'), async (req, res) => {
  const allowed = ['name', 'description', 'price_per_unit', 'stock_available', 'lead_time_days', 'is_active', 'minimum_order_qty'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase.from('materials').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

module.exports = router;
