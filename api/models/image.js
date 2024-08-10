const mongoose = require('mongoose');


/* SCHEMA of movie */
const imageSchema = new mongoose.Schema({
    name: String,
    img: {
      data: Buffer,
      contentType: String
    }
  });

/* User model */

const imageModel = mongoose.model('Image', imageSchema);

module.exports = imageModel;
