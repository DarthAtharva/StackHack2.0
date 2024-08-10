const mongoose = require('mongoose');


//reservation schema
const reservationSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    date: { type: Date, required: true },
    startAt: { type: Date, required: true },
    seats: { type: Number, required: true },
    orderID: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    total: { type: Number, required: true }, // seats * ticketPrice
    name: { type: String, required: true },
    phone: { type: String, required: true },
  }, { timestamps: true });
  
  const reservationModel = mongoose.model('Reservation', reservationSchema);

  
module.exports = {
    reservationModel
  };