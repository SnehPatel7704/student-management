const mongoose = require('mongoose')

const lectureSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  department: { type: String, required: true, trim: true, maxlength: 80 },
  program: { type: String, required: true, trim: true, maxlength: 80 },
  academicYear: { type: String, required: true, trim: true, maxlength: 30 },
  semester: { type: String, required: true, trim: true, maxlength: 30 },
  division: { type: String, required: true, trim: true, maxlength: 30 },
  dayOfWeek: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  room: { type: String, required: true, trim: true, maxlength: 40 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

lectureSchema.pre('validate', function validateTimes() {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) this.invalidate('endTime', 'End time must be later than start time.')
})

lectureSchema.index({ instructor: 1, dayOfWeek: 1, startTime: 1 })
lectureSchema.index({ department: 1, program: 1, academicYear: 1, semester: 1, division: 1 })

module.exports = mongoose.model('Lecture', lectureSchema)
