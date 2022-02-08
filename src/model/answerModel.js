const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const answerSchema = new mongoose.Schema({

    answeredBy: { type: ObjectId, required: true, ref: 'user' },
    questionId: { type: ObjectId, required: true, ref: 'question' },
    text: { type: String, required: true, },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

}, { timestamps: true })
module.exports = mongoose.model('answer', answerSchema)

