const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
     fname: { type: String, required: true, trim: true },
     lname: { type: String, required: true, trim: true },
     email: {
          type: String, required: true,
          lowercase: true, trim: true, unique: true
     },
     phone: { type: Number, unique: true },

     password: { type: String, required: true, min: 8, max: 15 },
     creditScore: { type: Number, required: true, default: 500 },
}, { timestamps: true })
module.exports = mongoose.model('user', userSchema)
