const mongoose = require('mongoose');


//showtime schema
const showtimeSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    ticketPrice: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  }, { timestamps: true });
  
  //showtime model 
  const showtimeModel = mongoose.model('Showtime', showtimeSchema);

  module.exports = showtimeModel;
    