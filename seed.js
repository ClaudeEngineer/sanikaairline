require('dotenv').config();
const mongoose = require('mongoose');
const Flight = require('./models/Flight');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skybook';

const AIRLINES = [
  { name: 'IndiGo',       code: '6E' },
  { name: 'Air India',    code: 'AI' },
  { name: 'SpiceJet',     code: 'SG' },
  { name: 'Vistara',      code: 'UK' },
  { name: 'GoAir',        code: 'G8' },
  { name: 'AirAsia India',code: 'I5' },
  { name: 'Emirates',     code: 'EK' },
  { name: 'Singapore Air',code: 'SQ' },
];

// Complete airport database
const AIRPORTS = {
  BOM: { city: 'Mumbai',    airport: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
  DEL: { city: 'Delhi',     airport: 'Indira Gandhi International Airport',               country: 'India' },
  BLR: { city: 'Bangalore', airport: 'Kempegowda International Airport',                 country: 'India' },
  MAA: { city: 'Chennai',   airport: 'Chennai International Airport',                    country: 'India' },
  GOA: { city: 'Goa',       airport: 'Manohar International Airport',                    country: 'India' },
  HYD: { city: 'Hyderabad', airport: 'Rajiv Gandhi International Airport',               country: 'India' },
  CCU: { city: 'Kolkata',   airport: 'Netaji Subhas Chandra Bose International Airport', country: 'India' },
  PNQ: { city: 'Pune',      airport: 'Pune International Airport',                       country: 'India' },
  AMD: { city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel International Airport',   country: 'India' },
  JAI: { city: 'Jaipur',    airport: 'Jaipur International Airport',                     country: 'India' },
  COK: { city: 'Kochi',     airport: 'Cochin International Airport',                     country: 'India' },
  IXC: { city: 'Chandigarh',airport: 'Chandigarh International Airport',                 country: 'India' },
  LKO: { city: 'Lucknow',   airport: 'Chaudhary Charan Singh International Airport',    country: 'India' },
  BHO: { city: 'Bhopal',    airport: 'Raja Bhoj Airport',                                country: 'India' },
  NAG: { city: 'Nagpur',    airport: 'Dr. Babasaheb Ambedkar International Airport',    country: 'India' },
  IXB: { city: 'Bagdogra',  airport: 'Bagdogra International Airport',                  country: 'India' },
  GAU: { city: 'Guwahati',  airport: 'Lokpriya Gopinath Bordoloi International Airport',country: 'India' },
  BBI: { city: 'Bhubaneswar',airport: 'Biju Patnaik International Airport',             country: 'India' },
  VTZ: { city: 'Vizag',     airport: 'Visakhapatnam International Airport',             country: 'India' },
  SXR: { city: 'Srinagar',  airport: 'Sheikh ul-Alam International Airport',            country: 'India' },
  DXB: { city: 'Dubai',     airport: 'Dubai International Airport',                     country: 'UAE' },
  AUH: { city: 'Abu Dhabi', airport: 'Abu Dhabi International Airport',                 country: 'UAE' },
  SIN: { city: 'Singapore', airport: 'Changi Airport',                                  country: 'Singapore' },
  BKK: { city: 'Bangkok',   airport: 'Suvarnabhumi Airport',                            country: 'Thailand' },
  LHR: { city: 'London',    airport: 'Heathrow Airport',                                country: 'UK' },
  CDG: { city: 'Paris',     airport: 'Charles de Gaulle Airport',                       country: 'France' },
  NRT: { city: 'Tokyo',     airport: 'Narita International Airport',                    country: 'Japan' },
  KUL: { city: 'Kuala Lumpur',airport: 'Kuala Lumpur International Airport',            country: 'Malaysia' },
  SYD: { city: 'Sydney',    airport: 'Kingsford Smith Airport',                         country: 'Australia' },
  JFK: { city: 'New York',  airport: 'John F. Kennedy International Airport',           country: 'USA' },
};

// ALL routes — bidirectional (both A→B and B→A)
const BASE_ROUTES = [
  ['BOM','DEL','2h 10m'], ['BOM','BLR','2h 05m'], ['BOM','GOA','1h 15m'],
  ['BOM','HYD','1h 30m'], ['BOM','CCU','2h 30m'], ['BOM','MAA','2h 00m'],
  ['BOM','PNQ','0h 55m'], ['BOM','AMD','1h 10m'], ['BOM','COK','2h 00m'],
  ['BOM','JAI','1h 45m'], ['BOM','DXB','3h 05m'], ['BOM','SIN','5h 30m'],
  ['BOM','BKK','4h 20m'], ['BOM','LHR','9h 50m'], ['BOM','KUL','4h 50m'],
  ['DEL','BLR','2h 45m'], ['DEL','MAA','2h 40m'], ['DEL','HYD','2h 20m'],
  ['DEL','CCU','2h 20m'], ['DEL','GOA','2h 30m'], ['DEL','COK','3h 15m'],
  ['DEL','JAI','1h 05m'], ['DEL','LKO','1h 20m'], ['DEL','AMD','1h 40m'],
  ['DEL','IXC','1h 00m'], ['DEL','SXR','1h 30m'], ['DEL','DXB','3h 45m'],
  ['DEL','LHR','9h 15m'], ['DEL','CDG','8h 50m'], ['DEL','NRT','7h 30m'],
  ['DEL','JFK','15h 30m'],['DEL','SYD','14h 00m'],
  ['BLR','MAA','1h 05m'], ['BLR','HYD','1h 15m'], ['BLR','CCU','2h 30m'],
  ['BLR','COK','1h 20m'], ['BLR','PNQ','1h 25m'], ['BLR','GOA','1h 10m'],
  ['BLR','DXB','4h 00m'], ['BLR','SIN','5h 00m'],
  ['HYD','MAA','1h 10m'], ['HYD','CCU','2h 05m'], ['HYD','COK','1h 40m'],
  ['MAA','CCU','2h 30m'], ['MAA','COK','1h 15m'],  ['MAA','DXB','4h 15m'],
  ['CCU','GAU','1h 10m'],  ['CCU','BBI','0h 55m'],  ['CCU','DXB','5h 30m'],
];

function makeRoute(fromCode, toCode, duration, stops) {
  return {
    from: { ...AIRPORTS[fromCode], code: fromCode },
    to:   { ...AIRPORTS[toCode],   code: toCode },
    dur: duration,
    stops: stops || 0,
  };
}

// Build bidirectional routes
function buildAllRoutes() {
  const routes = [];
  BASE_ROUTES.forEach(([a, b, dur, stops]) => {
    routes.push(makeRoute(a, b, dur, stops));   // A → B
    routes.push(makeRoute(b, a, dur, stops));   // B → A (reverse)
  });
  return routes;
}

const DISCOUNT_POOLS = [
  [{ code: 'FIRST50',   percentage: 50, description: '50% off first booking',        validTill: new Date('2027-12-31') }],
  [{ code: 'WEEKEND15', percentage: 15, description: 'Weekend getaway discount',      validTill: new Date('2027-12-31') },
   { code: 'MONSOON30', percentage: 30, description: 'Monsoon travel offer',          validTill: new Date('2027-10-31') }],
  [{ code: 'FAMILY25',  percentage: 25, description: 'Family pack (3+ passengers)',   validTill: new Date('2027-12-31') }],
  [],
  [{ code: 'EARLYBIRD', percentage: 10, description: 'Early bird booking discount',   validTill: new Date('2027-12-31') }],
  [{ code: 'SUMMER20',  percentage: 20, description: 'Summer special offer',          validTill: new Date('2027-09-30') }],
];

function priceFor(fromCode, toCode) {
  const international = ['DXB','AUH','SIN','BKK','LHR','CDG','NRT','KUL','SYD','JFK'];
  const isIntl = international.includes(fromCode) || international.includes(toCode);
  if (isIntl) return 6000 + Math.floor(Math.random() * 20000);
  return 1800 + Math.floor(Math.random() * 4000);
}

function generateFlights() {
  const flights = [];
  const allRoutes = buildAllRoutes();
  const today = new Date();
  let counter = 1;

  // 60 days of flights
  for (let day = 0; day < 60; day++) {
    const base = new Date(today);
    base.setDate(today.getDate() + day);

    // Each day, run a subset of routes
    const routeSubset = allRoutes.filter((_, i) => (i + day) % 3 !== 0);

    routeSubset.forEach((route, idx) => {
      const airline = AIRLINES[idx % AIRLINES.length];
      const times = [[6,0],[8,30],[11,0],[14,30],[17,0],[20,30]];
      const [h, m] = times[(idx + day) % times.length];
      const dep = new Date(base);
      dep.setHours(h, m, 0, 0);

      const [dh, dm] = route.dur.match(/\d+/g).map(Number);
      const arr = new Date(dep.getTime() + (dh * 60 + dm) * 60000);

      const eco = priceFor(route.from.code, route.to.code);

      flights.push({
        flightNumber: `${airline.code}${String(counter++).padStart(4,'0')}`,
        airline: airline.name,
        from: route.from,
        to:   route.to,
        departureTime: dep,
        arrivalTime:   arr,
        duration:      route.dur,
        stops:         route.stops || 0,
        stopDetails:   route.stops ? [{ city: 'Transit', duration: '1h 30m' }] : [],
        aircraft: idx % 2 === 0 ? 'Airbus A320' : 'Boeing 737-800',
        seats: {
          economy:    { total: 150, available: 80 + Math.floor(Math.random()*70), price: eco },
          business:   { total: 30,  available: 10 + Math.floor(Math.random()*20), price: Math.round(eco*2.6) },
          firstClass: { total: 10,  available: 2  + Math.floor(Math.random()*8),  price: Math.round(eco*5.2) },
        },
        amenities: ['Meals','Blanket', idx%3===0?'WiFi':'Entertainment','USB Charging'],
        discounts: DISCOUNT_POOLS[idx % DISCOUNT_POOLS.length],
        rating: parseFloat((3.6 + Math.random()*1.4).toFixed(1)),
        meals: true,
        wifi: idx % 3 === 0,
        entertainment: idx % 2 === 0,
        baggage: { cabin: '7 kg', checkin: eco > 8000 ? '30 kg' : '23 kg' },
        status: 'scheduled',
      });
    });
  }
  return flights;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  await Flight.deleteMany({});
  await User.deleteMany({});

  const flights = generateFlights();
  await Flight.insertMany(flights);
  console.log(`✅ Seeded ${flights.length} flights across ${buildAllRoutes().length} bidirectional routes`);

  await new User({ name: 'Demo User', email: 'demo@skybook.com', password: 'demo1234', phone: '+91 9876543210' }).save();
  console.log('✅ Demo user: demo@skybook.com / demo1234');

  await new User({ name: 'SkyBook Admin', email: 'admin@skybook.com', password: 'admin1234', role: 'admin' }).save();
  console.log('✅ Admin: admin@skybook.com / admin1234');

  await mongoose.disconnect();
  console.log(`\n🎉 Done! ${flights.length} flights seeded.`);
}

seed().catch(e => { console.error(e); process.exit(1); });
