const mongoose = require('mongoose');
const {Schema} = mongoose;

/* SCHEMA of user */
const userSchema = new Schema({

    username:{type: String, required: true },
    email: {type: String, unique: true},
    password: String,
    role: { type: String, enum: ['Admin', 'Customer', 'SuperAdmin'], required: true },
    orderID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }]   // Array of reservations

}, { timestamps: true });

// Create an index on the email field
//userSchema.index({ email: 1 }); // 1 for ascending order, -1 for descending



/* User model */

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
