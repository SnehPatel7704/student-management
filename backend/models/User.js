const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const roles = ['super_admin', 'admin', 'director', 'head', 'teacher', 'student', 'parent', 'guest', 'dev']

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, required: true, select: false, minlength: 10 },
  role: { type: String, required: true, enum: roles },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  department: { type: String, trim: true },
  active: { type: Boolean, default: true },
  developmentAccount: { type: Boolean, default: false },
}, { timestamps: true })

userSchema.pre('validate', function validateRoleLink() {
  if (['student', 'parent'].includes(this.role) && !this.student) this.invalidate('student', 'A linked student record is required for this role.')
  if (this.role === 'teacher' && !this.instructor) this.invalidate('instructor', 'A linked instructor record is required for this role.')
  if (['head', 'director'].includes(this.role) && !this.department) this.invalidate('department', 'A department is required for this role.')
})

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.set('toJSON', {
  transform(_document, result) {
    delete result.password
    delete result.__v
    return result
  },
})

module.exports = mongoose.model('User', userSchema)