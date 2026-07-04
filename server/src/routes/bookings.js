const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth, requireRole } = require('../middleware/auth');

// Create a booking
router.post('/', requireAuth, async (req, res) => {
  const { supplier_id, delivery_date, delivery_address, notes, items } = req.body;

  if (!supplier_id || !delivery_date || !delivery_address || !items?.length) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const total_amount = items.reduce((sum, i) => sum + i.price_per_unit * i.quantity, 0);

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({ buyer_id: req.user.id, supplier_id, delivery_date, delivery_address, notes, total_amount, status: 'pending' })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  const bookingItems = items.map(i => ({
    booking_id: booking.id,
    material_id: i.material_id,
    quantity: i.quantity,
    price_per_unit: i.price_per_unit,
    total_price: i.price_per_unit * i.quantity,
  }));

  const { error: itemsError } = await supabase.from('booking_items').insert(bookingItems);
  if (itemsError) return res.status(500).json({ message: itemsError.message });

  res.status(201).json(booking);
});

// Update booking status (supplier only)
router.patch('/:id/status', requireAuth, requireRole('supplier', 'admin'), async (req, res) => {
  const { status } = req.body;
  const VALID = ['confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];

  if (!VALID.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Get single booking
router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, supplier:suppliers(*), items:booking_items(*, material:materials(*))')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Booking not found' });

  const isOwner = data.buyer_id === req.user.id;
  const isSupplier = req.profile?.role === 'supplier';
  const isAdmin = req.profile?.role === 'admin';

  if (!isOwner && !isSupplier && !isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(data);
});

module.exports = router;
