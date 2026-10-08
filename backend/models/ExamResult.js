const mongoose = require('mongoose')

const examResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  examType: { type: String, enum: ['Midterm', 'Final', 'Practical'], required: true },
  marksObtained: { type: Number, required: true, min: 0 },
  maxMarks: { type: Number, required: true, min: 1, default: 100 },
  grade: { type: String, enum: ['O', 'A+', 'A', 'B', 'F'] },
}, { timestamps: true })

examResultSchema.index({ student: 1, course: 1, examType: 1 }, { unique: true })
module.exports = mongoose.model('ExamResult', examResultSchema)
