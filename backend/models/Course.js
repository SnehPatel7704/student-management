const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  capacity: { type: Number, required: true, min: 1 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema)
