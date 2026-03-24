const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline:      { type: String, required: true },
  from: {
    city: String, airport: String, code: { type: String, required: true }, country: String,
  },
  to: {
    city: String, airport: String, code: { type: String, required: true }, country: String,
  },
  departureTime: { type: Date, required: true },
  arrivalTime:   { type: Date, required: true },
  duration:      { type: String, default: '' },
  stops:         { type: Number, default: 0 },
  stopDetails:   [{ city: String, duration: String }],
  aircraft:      { type: String, default: 'Airbus A320' },
  seats: {
    economy:    { total: { type: Number, default: 150 }, available: { type: Number, default: 150 }, price: { type: Number, required: true } },
    business:   { total: { type: Number, default: 30  }, available: { type: Number, default: 30  }, price: { type: Number, required: true } },
    firstClass: { total: { type: Number, default: 10  }, available: { type: Number, default: 10  }, price: { type: Number, required: true } },
  },
  amenities:     [String],
  status:        { type: String, enum: ['scheduled','delayed','cancelled','completed'], default: 'scheduled' },
  discounts: [{
    code: String, percentage: Number, description: String,
    validTill: Date, minSeats: { type: Number, default: 1 },
  }],
  rating:        { type: Number, default: 4.2 },
  meals:         { type: Boolean, default: true },
  wifi:          { type: Boolean, default: false },
  entertainment: { type: Boolean, default: true },
  baggage: {
    cabin:   { type: String, default: '7 kg' },
    checkin: { type: String, default: '23 kg' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
