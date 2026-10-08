const mongoose = require('mongoose')

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Social'], required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true })

module.exports = mongoose.model('Club', clubSchema)
