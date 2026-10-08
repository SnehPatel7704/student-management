const mongoose = require('mongoose')
const Student = require('../models/Student')
const Course = require('../models/Course')
const Instructor = require('../models/Instructor')
const Internship = require('../models/Internship')
const Attendance = require('../models/Attendance')
const Club = require('../models/Club')
const Book = require('../models/Book')
const BorrowRecord = require('../models/BorrowRecord')
const ExamResult = require('../models/ExamResult')

const validateObjectId = (id, field = 'ID') => {
  if (!mongoose.isValidObjectId(id)) return { error: `${field} is not a valid ObjectId` }
  return null
}

const normalizePagination = (query) => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10)),
})

const getGrade = (marks) => {
  if (marks >= 90) return 'O'
  if (marks >= 85) return 'A+'
  if (marks >= 75) return 'A'
  if (marks >= 65) return 'B'
  return 'F'
}

exports.getStudents = async (req, res, next) => {
  try {
    const { page, limit } = normalizePagination(req.query)
    const query = {}
    if (req.query.search) query.$text = { $search: req.query.search }
    if (req.query.course && req.query.course !== 'All courses') query.course = req.query.course
    const sort = req.query.sort === 'age-asc' ? { age: 1 } : req.query.sort === 'age-desc' ? { age: -1 } : { createdAt: -1 }
    const [students, total] = await Promise.all([
      Student.find(query).sort(sort).skip((page - 1) * limit).limit(limit),
      Student.countDocuments(query),
    ])
    res.json({ students, pagination: { total, page, totalPages: Math.ceil(total / limit), limit } })
  } catch (error) { next(error) }
}

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json(student)
  } catch (error) { next(error) }
}

exports.createStudent = async (req, res, next) => {
  try { res.status(201).json(await Student.create(req.body, { runValidators: true })) } catch (error) { next(error) }
}

exports.updateStudent = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json(student)
  } catch (error) { next(error) }
}

exports.deleteStudent = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json({ message: 'Student deleted.' })
  } catch (error) { next(error) }
}

exports.bulkDeleteStudents = async (req, res, next) => {
  try {
    const ids = req.body.ids
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'Provide a non-empty ids array.' })
    const result = await Student.deleteMany({ _id: { $in: ids } })
    res.json({ message: 'Students deleted.', deletedCount: result.deletedCount })
  } catch (error) { next(error) }
}

exports.bulkImportStudents = async (req, res, next) => {
  try {
    const records = Array.isArray(req.body.students) ? req.body.students : req.body
    const errors = []
    const inserted = []
    for (const [index, record] of records.entries()) {
      try { inserted.push(await Student.create(record, { runValidators: true })) }
      catch (error) { errors.push({ index, message: error.message }) }
    }
    res.status(201).json({ insertedCount: inserted.length, failedCount: errors.length, errors, inserted })
  } catch (error) { next(error) }
}

exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const [courseDistribution, ageGroups, enrollments] = await Promise.all([
      Student.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Student.aggregate([{
        $group: {
          _id: {
            $cond: [
              { $lt: ['$age', 18] }, 'Under 18',
              { $cond: [{ $lte: ['$age', 22] }, '18-22', { $cond: [{ $lte: ['$age', 26] }, '23-26', '27+'] }] },
            ],
          },
          count: { $sum: 1 },
        },
      }]),
      Student.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ])
    res.json({ courseDistribution, ageGroups, monthlyEnrollment: enrollments })
  } catch (error) { next(error) }
}

exports.getCourses = async (req, res, next) => {
  try { res.json(await Course.find().populate('instructor', 'name staffId department').sort({ code: 1 })) } catch (error) { next(error) }
}
exports.createCourse = async (req, res, next) => {
  try { res.status(201).json(await Course.create(req.body, { runValidators: true })) } catch (error) { next(error) }
}
exports.deleteCourse = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Course ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' })
    res.json({ message: 'Course deleted.' })
  } catch (error) { next(error) }
}

exports.getInstructors = async (req, res, next) => {
  try { res.json(await Instructor.find().sort({ name: 1 })) } catch (error) { next(error) }
}
exports.createInstructor = async (req, res, next) => {
  try { res.status(201).json(await Instructor.create(req.body, { runValidators: true })) } catch (error) { next(error) }
}
exports.deleteInstructor = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Instructor ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const instructor = await Instructor.findByIdAndDelete(req.params.id)
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found.' })
    res.json({ message: 'Instructor deleted.' })
  } catch (error) { next(error) }
}

exports.getInternships = async (req, res, next) => {
  try { res.json(await Internship.find().sort({ deadline: 1 })) } catch (error) { next(error) }
}
exports.createInternship = async (req, res, next) => {
  try { res.status(201).json(await Internship.create(req.body, { runValidators: true })) } catch (error) { next(error) }
}
exports.applyInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id)
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' })
    if (!internship.applicants.includes(req.body.studentId)) internship.applicants.push(req.body.studentId)
    await internship.save({ runValidators: true })
    res.json(internship)
  } catch (error) { next(error) }
}

exports.getClubs = async (req, res, next) => {
  try { res.json(await Club.find().populate('lead', 'name').populate('members', 'name email')) } catch (error) { next(error) }
}
exports.createClub = async (req, res, next) => {
  try { res.status(201).json(await Club.create(req.body, { runValidators: true })) } catch (error) { next(error) }
}
exports.joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' })
    if (!club.members.includes(req.body.studentId)) club.members.push(req.body.studentId)
    await club.save({ runValidators: true })
    res.json(club)
  } catch (error) { next(error) }
}

exports.logAttendance = async (req, res, next) => {
  try {
    const entry = await Attendance.findOneAndUpdate(
      { student: req.body.student, course: req.body.course, date: req.body.date || new Date() },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    )
    res.status(201).json(entry)
  } catch (error) { next(error) }
}
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const records = await Attendance.find({ student: req.params.id })
    const present = records.filter((record) => record.status === 'Present').length
    const percentage = records.length ? (present / records.length) * 100 : 0
    res.json({ percentage: Number(percentage.toFixed(2)), records })
  } catch (error) { next(error) }
}

exports.recordGrade = async (req, res, next) => {
  try {
    const marksObtained = Number(req.body.marksObtained)
    const maxMarks = Number(req.body.maxMarks ?? 100)
    if (!Number.isFinite(marksObtained) || !Number.isFinite(maxMarks) || marksObtained < 0 || marksObtained > maxMarks || maxMarks < 1) {
      return res.status(400).json({ success: false, message: 'Marks must satisfy 0 <= marksObtained <= maxMarks and maxMarks must be at least 1.' })
    }
    const grade = getGrade(marksObtained)
    const result = await ExamResult.findOneAndUpdate(
      { student: req.body.student, course: req.body.course, examType: req.body.examType },
      { ...req.body, marksObtained, maxMarks, grade },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    res.status(201).json(result)
  } catch (error) { next(error) }
}
exports.getStudentGrades = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.studentId, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const results = await ExamResult.find({ student: req.params.studentId }).populate('course', 'code title')
    const totalPoints = results.reduce((sum, result) => sum + ({ O: 10, 'A+': 9, A: 8, B: 7, F: 0 }[result.grade] || 0), 0)
    const gpa = results.length ? totalPoints / results.length : 0
    res.json({ results, gpa: Number(gpa.toFixed(2)), sgpa: Number(gpa.toFixed(2)) })
  } catch (error) { next(error) }
}

exports.getBooks = async (req, res, next) => {
  try { res.json(await Book.find().sort({ title: 1 })) } catch (error) { next(error) }
}
exports.createBook = async (req, res, next) => {
  try { res.status(201).json(await Book.create(req.body, { runValidators: true })) } catch (error) { next(error) }
}
exports.issueBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.body.book)
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' })
    if (book.availableCopies <= 0) return res.status(400).json({ success: false, message: 'No copies are available for issue.' })
    const session = await mongoose.startSession()
    let result
    try {
      await session.withTransaction(async () => {
        const updated = await Book.findOneAndUpdate(
          { _id: book._id, availableCopies: { $gt: 0 } },
          { $inc: { availableCopies: -1 } },
          { new: true, runValidators: true },
        )
        if (!updated) throw new Error('Book became unavailable between reads.')
        result = await BorrowRecord.create(
          [{ student: req.body.student, book: book._id, dueDate: req.body.dueDate, status: 'Issued' }],
          { runValidators: true },
        )
      })
    } finally { await session.endSession() }
    res.status(201).json({ book: result[0], message: 'Book issued successfully.' })
  } catch (error) { next(error) }
}
exports.returnBook = async (req, res, next) => {
  try {
    const record = await BorrowRecord.findById(req.params.recordId)
    if (!record) return res.status(404).json({ success: false, message: 'Borrow record not found.' })
    await Promise.all([
      BorrowRecord.findByIdAndUpdate(record._id, { returnDate: new Date(), status: 'Returned' }, { runValidators: true }),
      Book.findByIdAndUpdate(record.book, { $inc: { availableCopies: 1 } }, { runValidators: true }),
    ])
    res.json({ message: 'Book returned successfully.' })
  } catch (error) { next(error) }
}
exports.getStudentBorrows = async (req, res, next) => {
  try { res.json(await BorrowRecord.find({ student: req.params.studentId }).populate('book', 'title isbn')) } catch (error) { next(error) }
}
