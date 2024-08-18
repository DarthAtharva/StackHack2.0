const mongoose = require('mongoose');
const {Schema} = mongoose;

/* SCHEMA of user */
const userSchema = new Schema({

    name: String,
    email: {type: String, unique: true},
    password: String,
    role: { type: String, enum: ['superAdmin', 'admin', 'customer'], default: 'customer' }, // role field

});

/* User model */

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
