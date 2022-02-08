const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const questionSchema = new mongoose.Schema({
    description: { type: String, required: true, trim: true },

    tag: { type: [String], lowercase: true, trim: true },

    askedBy: { type: ObjectId, ref: 'user' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },


}, { timestamps: true })
module.exports = mongoose.model('question', questionSchema)
