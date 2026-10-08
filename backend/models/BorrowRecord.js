const mongoose = require('mongoose')

const borrowRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['Issued', 'Returned', 'Overdue'], default: 'Issued' },
}, { timestamps: true })

borrowRecordSchema.index({ student: 1, status: 1 })
module.exports = mongoose.model('BorrowRecord', borrowRecordSchema)
