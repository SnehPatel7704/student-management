const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    course: { type: String, required: true, trim: true, maxlength: 80 },
    age: { type: Number, required: true, min: 1, max: 120 },
  },
  { timestamps: true },
);

studentSchema.path('email').validate((email) => /^\S+@\S+\.\S+$/.test(email), 'Enter a valid email address.');

module.exports = mongoose.model('Student', studentSchema);