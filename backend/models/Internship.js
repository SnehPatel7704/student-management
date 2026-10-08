const mongoose = require('mongoose')

const internshipSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  stipend: { type: Number, default: 0, min: 0 },
  workMode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'Remote' },
  deadline: { type: Date, required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
}, { timestamps: true })

module.exports = mongoose.model('Internship', internshipSchema)
