const mongoose = require('mongoose')

const instructorSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  department: { type: String, required: true, trim: true },
  designation: { type: String, required: true, trim: true },
}, { timestamps: true })

module.exports = mongoose.model('Instructor', instructorSchema)
