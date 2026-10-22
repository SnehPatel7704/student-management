const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 254,
      match: /^\S+@\S+\.\S+$/,
    },
    course: { type: String, required: true, trim: true, maxlength: 80 },
    program: { type: String, trim: true, maxlength: 80 },
    academicYear: { type: String, trim: true, maxlength: 30 },
    semester: { type: String, trim: true, maxlength: 30 },
    division: { type: String, trim: true, maxlength: 30 },
    department: { type: String, trim: true, maxlength: 80 },
    age: { type: Number, required: true, min: 1, max: 120 },
  },
  { timestamps: true },
)

studentSchema.index({ course: 1, createdAt: -1 })
studentSchema.index({ department: 1, program: 1, academicYear: 1, semester: 1, division: 1 })
studentSchema.index({ name: 'text', email: 'text', course: 'text' })

module.exports = mongoose.model('Student', studentSchema)