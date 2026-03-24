const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const passengerSchema = new mongoose.Schema({
  firstName:      { type: String, required: true },
  lastName:       { type: String, required: true },
  age:            { type: Number, required: true },
  gender:         { type: String, enum: ['male','female','other'], required: true },
  passportNumber: { type: String, default: '' },
  seatNumber:     { type: String, default: '' },
  mealPreference: { type: String, enum: ['veg','non-veg','vegan','none'], default: 'none' },
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String, unique: true,
    default: () => 'SKY' + uuidv4().slice(0, 8).toUpperCase(),
  },
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flight:         { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  passengers:     [passengerSchema],
  seatClass:      { type: String, enum: ['economy','business','firstClass'], default: 'economy' },
  totalPassengers:{ type: Number, required: true },
  baseFare:       { type: Number, required: true },
  taxes:          { type: Number, required: true },
  discountApplied:{ type: Number, default: 0 },
  discountCode:   { type: String, default: '' },
  totalAmount:    { type: Number, required: true },
  paymentStatus:  { type: String, enum: ['pending','paid','refunded','failed'], default: 'pending' },
  paymentMethod:  { type: String, default: 'card' },
  status:         { type: String, enum: ['confirmed','cancelled','pending','completed'], default: 'pending' },
  cancellationReason: { type: String, default: '' },
  cancellationDate:   { type: Date },
  refundAmount:   { type: Number, default: 0 },
  refundStatus:   { type: String, enum: ['none','initiated','processed'], default: 'none' },
  contactEmail:   { type: String, required: true },
  contactPhone:   { type: String, required: true },
  specialRequests:{ type: String, default: '' },
  checkedIn:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
