const mongoose = require('mongoose');


/* SCHEMA of movie */
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String},
    releaseDate: { type: Date},
    genre: { type: String },
  });

/* movie model */

const movieModel = mongoose.model('Movie', movieSchema);







module.exports = movieModel;
