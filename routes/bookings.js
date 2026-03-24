const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const Flight  = require('../models/Flight');
const User    = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// POST /api/bookings  — create booking
router.post('/', protect, async (req, res) => {
  try {
    const { flightId, passengers, seatClass, discountCode, discountPercentage,
            contactEmail, contactPhone, specialRequests, paymentMethod } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    const seatInfo = flight.seats[seatClass];
    if (!seatInfo || seatInfo.available < passengers.length)
      return res.status(400).json({ message: 'Not enough seats available' });

    const baseFare       = seatInfo.price * passengers.length;
    const taxes          = Math.round(baseFare * 0.18);
    const discountApplied= discountPercentage ? Math.round(baseFare * discountPercentage / 100) : 0;
    const totalAmount    = baseFare + taxes - discountApplied;

    const booking = await Booking.create({
      user: req.user._id, flight: flightId, passengers, seatClass,
      totalPassengers: passengers.length, baseFare, taxes,
      discountApplied, discountCode: discountCode || '',
      totalAmount, paymentStatus: 'paid', paymentMethod: paymentMethod || 'card',
      status: 'confirmed', contactEmail, contactPhone, specialRequests: specialRequests || '',
    });

    // Update availability
    flight.seats[seatClass].available -= passengers.length;
    await flight.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    const pop = await booking.populate('flight');
    res.status(201).json(pop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bookings/my
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('flight').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bookings (admin — all bookings)
router.get('/', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('flight').populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id)
      .populate('flight').populate('user', 'name email');
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (b.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    res.json(b);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id).populate('flight');
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (b.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    if (b.status === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled' });

    const hrs = (new Date(b.flight.departureTime) - new Date()) / (1000 * 60 * 60);
    const pct = hrs >= 48 ? 90 : hrs >= 24 ? 50 : hrs >= 4 ? 25 : 0;
    const refundAmount = Math.round(b.totalAmount * pct / 100);

    b.status             = 'cancelled';
    b.cancellationReason = req.body.reason || 'Cancelled by user';
    b.cancellationDate   = new Date();
    b.refundAmount       = refundAmount;
    b.refundStatus       = refundAmount > 0 ? 'initiated' : 'none';
    if (refundAmount > 0) b.paymentStatus = 'refunded';
    await b.save();

    await Flight.findByIdAndUpdate(b.flight._id, {
      $inc: { [`seats.${b.seatClass}.available`]: b.totalPassengers },
    });

    res.json({ booking: b, refundAmount, refundPercentage: pct,
      message: `Cancelled. Refund of ₹${refundAmount} initiated.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
