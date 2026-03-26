
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

// ✅ Allowed Frontend Origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://skyflightsbooking.netlify.app',
  'https://skkyflights.netlify.app',
  'https://punedeveloper.in',

];

// ✅ CORS Setup (FINAL FIX)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / mobile apps
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Handle Preflight Requests (VERY IMPORTANT)
app.options('*', cors());

// ✅ Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/flights',  require('./routes/flights'));
app.use('/api/bookings', require('./routes/bookings'));

// ✅ Health Check
app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', app: 'SkyBook API ✈', version: '2.0' });
});

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('SkyBook API is running 🚀');
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SkyBook API running → http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
});

