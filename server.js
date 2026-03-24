
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:5173'],
//   credentials: true,
// }));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://skyflightsbooking.netlify.app' // 👈 your frontend URL
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/flights',  require('./routes/flights'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/api/health', (_, res) => res.json({ status: 'OK', app: 'SkyBook API ✈', version: '2.0' }));
app.get('/', (req, res) => {
  res.send('SkyBook API is running 🚀');
});
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SkyBook API running → http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
});
