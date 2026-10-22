require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Student = require('../models/Student')
const Instructor = require('../models/Instructor')

async function createDevUser() {
  if (process.env.NODE_ENV === 'production') throw new Error('Development accounts cannot be created in production.')
  const { DEV_USER_NAME, DEV_USER_EMAIL, DEV_USER_PASSWORD, MONGODB_URI } = process.env
  if (!DEV_USER_EMAIL || !DEV_USER_PASSWORD) throw new Error('Set DEV_USER_EMAIL and DEV_USER_PASSWORD before running this command.')
  await mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1:27017/collegeDB')
  const existing = await User.findOne({ email: DEV_USER_EMAIL.toLowerCase() })
  if (existing) throw new Error('An account with DEV_USER_EMAIL already exists.')
  const [student, instructor] = await Promise.all([Student.findOne().select('_id'), Instructor.findOne().select('_id department')])
  await new User({
    name: DEV_USER_NAME || 'Campusdesk Developer',
    email: DEV_USER_EMAIL,
    password: DEV_USER_PASSWORD,
    role: 'dev',
    student: process.env.DEV_USER_STUDENT_ID || student?._id,
    instructor: process.env.DEV_USER_INSTRUCTOR_ID || instructor?._id,
    department: process.env.DEV_USER_DEPARTMENT || instructor?.department,
  }).save()
  console.log(`Created development role-switch account for ${DEV_USER_EMAIL}.`)
}

createDevUser().catch((error) => {
  console.error('Unable to create development account:', error.message)
  process.exitCode = 1
}).finally(() => mongoose.disconnect())
