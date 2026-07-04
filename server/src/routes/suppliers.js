const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// List all verified suppliers
router.get('/', async (req, res) => {
  const { search, sort = 'rating' } = req.query;

  let q = supabase.from('suppliers').select('*').eq('is_verified', true);

  if (sort === 'rating') q = q.order('rating', { ascending: false });
  else if (sort === 'name') q = q.order('company_name', { ascending: true });

  const { data, error } = await q;
  if (error) return res.status(500).json({ message: error.message });

  const filtered = search
    ? data.filter(s => s.company_name.toLowerCase().includes(search.toLowerCase()))
    : data;

  res.json(filtered);
});

// Get supplier profile + materials
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*, profile:profiles(full_name, email, phone)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Supplier not found' });
  res.json(data);
});

// Register/update supplier profile (supplier role only)
router.post('/register', requireAuth, requireRole('supplier'), async (req, res) => {
  const { company_name, description, location, certifications, capacity_per_month } = req.body;

  const { data: existing } = await supabase.from('suppliers').select('id').eq('profile_id', req.user.id).single();

  if (existing) {
    const { data, error } = await supabase.from('suppliers')
      .update({ company_name, description, location, certifications, capacity_per_month })
      .eq('id', existing.id).select().single();
    if (error) return res.status(500).json({ message: error.message });
    return res.json(data);
  }

  const { data, error } = await supabase.from('suppliers')
    .insert({ profile_id: req.user.id, company_name, description, location, certifications: certifications ?? [], capacity_per_month, rating: 0, total_reviews: 0, is_verified: false })
    .select().single();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

module.exports = router;
