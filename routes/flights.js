const express = require('express');
const router  = express.Router();
const Flight  = require('../models/Flight');
const { protect, admin } = require('../middleware/auth');

// GET /api/flights/search
router.get('/search', async (req, res) => {
  try {
    const { from, to, date, passengers = 1, seatClass = 'economy' } = req.query;
    const query = { status: { $ne: 'cancelled' } };
    if (from) query['from.code'] = { $regex: from, $options: 'i' };
    if (to)   query['to.code']   = { $regex: to,   $options: 'i' };
    if (date) {
      const d = new Date(date), d2 = new Date(date);
      d2.setDate(d2.getDate() + 1);
      query.departureTime = { $gte: d, $lt: d2 };
    }
    query[`seats.${seatClass}.available`] = { $gte: parseInt(passengers) };
    const flights = await Flight.find(query).sort({ departureTime: 1 });
    res.json(flights);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/flights/popular
router.get('/popular', async (req, res) => {
  try {
    const flights = await Flight.find({ status: 'scheduled' }).sort({ rating: -1 }).limit(6);
    res.json(flights);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/flights/validate-discount
router.post('/validate-discount', async (req, res) => {
  try {
    const { flightId, code } = req.body;
    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    const disc = flight.discounts.find(d =>
      d.code === code.toUpperCase() && new Date(d.validTill) > new Date()
    );
    if (!disc) return res.status(400).json({ message: 'Invalid or expired discount code' });
    res.json({ valid: true, percentage: disc.percentage, description: disc.description });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/flights (all)
router.get('/', async (req, res) => {
  try {
    const flights = await Flight.find({}).sort({ departureTime: 1 });
    res.json(flights);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/flights/:id
router.get('/:id', async (req, res) => {
  try {
    const f = await Flight.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Flight not found' });
    res.json(f);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/flights (admin add)
router.post('/', protect, admin, async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json(flight);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/flights/:id (admin update)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const f = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(f);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
