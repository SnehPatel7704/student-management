require('dotenv').config()
const mongoose = require('mongoose')
const Attendance = require('../models/Attendance')

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collegeDB'

async function migrateAttendanceIndexes() {
  await mongoose.connect(mongoUri)
  const indexes = await Attendance.collection.indexes()
  const oldIndex = indexes.find((index) => (
    index.unique
    && !index.partialFilterExpression
    && index.key.student === 1
    && index.key.course === 1
    && index.key.date === 1
    && Object.keys(index.key).length === 3
  ))

  if (oldIndex) await Attendance.collection.dropIndex(oldIndex.name)
  await Attendance.collection.createIndex(
    { student: 1, course: 1, date: 1 },
    { unique: true, partialFilterExpression: { lecture: { $exists: false } } },
  )
  await Attendance.collection.createIndex(
    { student: 1, lecture: 1, date: 1 },
    { unique: true, partialFilterExpression: { lecture: { $exists: true } } },
  )
  console.log('Lecture-aware attendance indexes are ready.')
}

migrateAttendanceIndexes()
  .catch((error) => {
    console.error('Attendance index migration failed:', error)
    process.exitCode = 1
  })
  .finally(async () => mongoose.disconnect())
