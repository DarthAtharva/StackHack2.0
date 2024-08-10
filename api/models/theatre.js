const mongoose = require('mongoose');

//theatre schema
const theatreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    ticketPrice: { type: Number, required: true }, // Default ticket price
    seats: { type: Number, required: true },
    //image: { type: String },  // URL to the theatre image
  }, { timestamps: true });
  
  //theatre model
  const theatreModel = mongoose.model('Theatre', theatreSchema);

  module.exports = theatreModel;