const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    theme:     { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);