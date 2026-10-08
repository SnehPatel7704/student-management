const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent', 'Excused'], default: 'Present' },
}, { timestamps: true })

attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true })
module.exports = mongoose.model('Attendance', attendanceSchema)
