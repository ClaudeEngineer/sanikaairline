const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('bookings');
  res.json(user);
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name  = req.body.name  || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = req.body.password;
    const u = await user.save();
    res.json({ _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, token: genToken(u._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
