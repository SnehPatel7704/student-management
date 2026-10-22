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
const Lecture = require('../models/Lecture')

exports.getPortal = async (req, res, next) => {
  try {
    if (!req.user.student) return res.status(403).json({ success: false, message: 'This account is not linked to a student record.' })
    const student = await Student.findById(req.user.student)
    if (!student) return res.status(404).json({ success: false, message: 'Linked student record not found.' })
    const [attendance, grades, borrows] = await Promise.all([
      Attendance.find({ student: student._id }).populate('course', 'code title department').populate('lecture', 'program academicYear semester division department dayOfWeek startTime endTime room').sort({ date: -1 }),
      ExamResult.find({ student: student._id }).populate('course', 'code title department').populate('student', 'name program academicYear semester division department course'),
      BorrowRecord.find({ student: student._id }).populate('book', 'title isbn').sort({ createdAt: -1 }),
    ])
    res.json({ student, attendance, grades, borrows })
  } catch (error) { next(error) }
}

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

const getCourseScope = (user) => {
  if (user.role === 'teacher') return { instructor: user.instructor }
  if (user.role === 'head' || (user.role === 'director' && user.developmentContext)) return { department: user.department }
  return {}
}

const isDepartmentManager = (user) => user.role === 'head' || (user.role === 'director' && user.developmentContext)
const canScopeStudentsByCourses = (user) => ['teacher', 'head'].includes(user.role) || (user.role === 'director' && user.developmentContext)

const canAccessCourse = async (user, courseId) => {
  if (!canScopeStudentsByCourses(user)) return true
  return Boolean(courseId && await Course.exists({ _id: courseId, ...getCourseScope(user) }))
}

const canManageStudentCourse = async (user, studentId, courseId) => {
  if (!canScopeStudentsByCourses(user)) return true
  if (!(await canAccessCourse(user, courseId))) return false
  const [student, course] = await Promise.all([
    Student.findById(studentId).select('course department'),
    Course.findById(courseId).select('department'),
  ])
  return Boolean(student && course && (student.department || student.course) === course.department)
}

const getStudentCourseScope = async (user, studentId) => {
  if (!canScopeStudentsByCourses(user)) return {}
  const student = await Student.findById(studentId).select('course department')
  if (!student) return { course: { $in: [] } }
  const department = student.department || student.course
  const courseIds = await Course.find({ department, ...getCourseScope(user) }).distinct('_id')
  return { course: { $in: courseIds } }
}

exports.getStudents = async (req, res, next) => {
  try {
    const { page, limit } = normalizePagination(req.query)
    const query = {}
    if (req.query.search) query.$text = { $search: req.query.search }
    if (req.query.course && req.query.course !== 'All courses') query.course = req.query.course
    if (canScopeStudentsByCourses(req.user)) {
      const departments = await Course.distinct('department', getCourseScope(req.user))
      query.$or = [{ department: { $in: departments } }, { department: { $exists: false }, course: { $in: departments } }]
    }
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
    if (canScopeStudentsByCourses(req.user) && !(await Course.exists({ department: student.department || student.course, ...getCourseScope(req.user) }))) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json(student)
  } catch (error) { next(error) }
}

exports.createStudent = async (req, res, next) => {
  try {
    if (isDepartmentManager(req.user) && (req.body.department || req.body.course) !== req.user.department) return res.status(403).json({ success: false, message: 'You can only create students in your department.' })
    const student = new Student(req.body)
    await student.save({ runValidators: true })
    res.status(201).json(student)
  } catch (error) { next(error) }
}

exports.updateStudent = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    if (isDepartmentManager(req.user)) {
      const existing = await Student.findById(req.params.id).select('course department')
      if (!existing || (existing.department || existing.course) !== req.user.department || (req.body.department && req.body.department !== req.user.department)) return res.status(404).json({ success: false, message: 'Student not found.' })
    }
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json(student)
  } catch (error) { next(error) }
}

exports.deleteStudent = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    if (isDepartmentManager(req.user)) {
      const existing = await Student.findById(req.params.id).select('course department')
      if (!existing || (existing.department || existing.course) !== req.user.department) return res.status(404).json({ success: false, message: 'Student not found.' })
    }
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json({ message: 'Student deleted.' })
  } catch (error) { next(error) }
}

exports.bulkDeleteStudents = async (req, res, next) => {
  try {
    const ids = req.body.ids
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'Provide a non-empty ids array.' })
    if (isDepartmentManager(req.user) && await Student.countDocuments({ _id: { $in: ids }, $or: [{ department: req.user.department }, { department: { $exists: false }, course: req.user.department }] }) !== ids.length) return res.status(404).json({ success: false, message: 'One or more student records were not found in your department.' })
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
      try {
        if (isDepartmentManager(req.user) && (record.department || record.course) !== req.user.department) throw new Error('You can only import students into your department.')
        const student = new Student(record)
        await student.save({ runValidators: true })
        inserted.push(student)
      } catch (error) { errors.push({ index, message: error.message }) }
    }
    res.status(201).json({ insertedCount: inserted.length, failedCount: errors.length, errors, inserted })
  } catch (error) { next(error) }
}

exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const match = isDepartmentManager(req.user) ? { department: req.user.department } : {}
    const [courseDistribution, ageGroups, enrollments] = await Promise.all([
      Student.aggregate([{ $match: match }, { $group: { _id: '$course', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Student.aggregate([{
        $match: match,
      }, {
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
      Student.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ])
    res.json({ courseDistribution, ageGroups, monthlyEnrollment: enrollments })
  } catch (error) { next(error) }
}

exports.getCourses = async (req, res, next) => {
  try { res.json(await Course.find(getCourseScope(req.user)).populate('instructor', 'name staffId department').sort({ code: 1 })) } catch (error) { next(error) }
}
exports.createCourse = async (req, res, next) => {
  try {
    if (req.user.role === 'head' && req.body.department !== req.user.department) return res.status(403).json({ success: false, message: 'You can only create courses in your department.' })
    const course = new Course(req.body)
    await course.save({ runValidators: true })
    res.status(201).json(course)
  } catch (error) { next(error) }
}
exports.updateCourse = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Course ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    if (req.user.role === 'head') {
      const existing = await Course.findById(req.params.id).select('department')
      if (!existing || existing.department !== req.user.department || (req.body.department && req.body.department !== req.user.department)) return res.status(404).json({ success: false, message: 'Course not found.' })
    }
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' })
    res.json(course)
  } catch (error) { next(error) }
}
exports.deleteCourse = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Course ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    if (req.user.role === 'head' && !(await Course.exists({ _id: req.params.id, department: req.user.department }))) return res.status(404).json({ success: false, message: 'Course not found.' })
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' })
    res.json({ message: 'Course deleted.' })
  } catch (error) { next(error) }
}

exports.getInstructors = async (req, res, next) => {
  try {
    const query = isDepartmentManager(req.user) ? { department: req.user.department } : {}
    res.json(await Instructor.find(query).sort({ name: 1 }))
  } catch (error) { next(error) }
}
exports.createInstructor = async (req, res, next) => {
  try {
    const instructor = new Instructor(req.body)
    await instructor.save({ runValidators: true })
    res.status(201).json(instructor)
  } catch (error) { next(error) }
}
exports.updateInstructor = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Instructor ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const instructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found.' })
    res.json(instructor)
  } catch (error) { next(error) }
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

exports.getLectures = async (req, res, next) => {
  try {
    let query
    const studentPortal = ['student', 'parent'].includes(req.user.role)
    if (studentPortal) {
      const student = req.user.student && await Student.findById(req.user.student).select('program academicYear semester division department course')
      if (!student) return res.status(403).json({ success: false, message: 'A linked student record is required to view this timetable.' })
      query = {
        active: true,
        program: student.program,
        academicYear: student.academicYear,
        semester: student.semester,
        division: student.division,
        department: student.department || student.course,
      }
    } else {
      query = { active: true, ...getCourseScope(req.user) }
    }
    if (!studentPortal) {
      if (req.query.instructor && mongoose.isValidObjectId(req.query.instructor)) query.instructor = req.query.instructor
      if (req.query.course && mongoose.isValidObjectId(req.query.course)) query.course = req.query.course
      if (req.query.department) query.department = req.query.department
    }
    res.json(await Lecture.find(query).populate('course', 'code title department').populate('instructor', 'name staffId designation').sort({ dayOfWeek: 1, startTime: 1 }))
  } catch (error) { next(error) }
}

const hasLectureConflict = (lecture, excludeId) => {
  const query = {
    active: true,
    dayOfWeek: lecture.dayOfWeek,
    startTime: { $lt: lecture.endTime },
    endTime: { $gt: lecture.startTime },
    $or: [
      { instructor: lecture.instructor },
      {
        department: lecture.department,
        program: lecture.program,
        academicYear: lecture.academicYear,
        semester: lecture.semester,
        division: lecture.division,
      },
    ],
  }
  if (excludeId) query._id = { $ne: excludeId }
  return Lecture.exists(query)
}

exports.createLecture = async (req, res, next) => {
  try {
    if (validateObjectId(req.body.course, 'Course ID') || validateObjectId(req.body.instructor, 'Instructor ID')) return res.status(400).json({ success: false, message: 'Choose valid course and instructor records.' })
    const [course, instructor] = await Promise.all([
      Course.findById(req.body.course),
      Instructor.findById(req.body.instructor),
    ])
    if (!course || !instructor) return res.status(400).json({ success: false, message: 'Choose an existing course and instructor.' })
    if (req.user.role === 'head' && course.department !== req.user.department) return res.status(403).json({ success: false, message: 'You can only schedule lectures in your department.' })
    if (course.department !== instructor.department || course.department !== req.body.department) return res.status(400).json({ success: false, message: 'The lecture, course, and instructor must belong to the same department.' })
    if (!(await Course.exists({ _id: course._id, ...getCourseScope(req.user) })) && ['teacher', 'head'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'You can only schedule lectures for courses in your department.' })
    if (await hasLectureConflict(req.body)) return res.status(409).json({ success: false, message: 'This timetable slot conflicts with another lecture for the instructor or class division.' })
    const lecture = new Lecture(req.body)
    await lecture.save({ runValidators: true })
    res.status(201).json(await lecture.populate([{ path: 'course', select: 'code title department' }, { path: 'instructor', select: 'name staffId designation' }]))
  } catch (error) { next(error) }
}

exports.updateLecture = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Lecture ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const existing = await Lecture.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Lecture not found.' })
    if (req.user.role === 'head' && existing.department !== req.user.department) return res.status(404).json({ success: false, message: 'Lecture not found.' })
    const courseId = req.body.course || existing.course
    const instructorId = req.body.instructor || existing.instructor
    const department = req.body.department || existing.department
    if (req.user.role === 'head' && department !== req.user.department) return res.status(403).json({ success: false, message: 'You can only schedule lectures in your department.' })
    if (validateObjectId(courseId, 'Course ID') || validateObjectId(instructorId, 'Instructor ID')) return res.status(400).json({ success: false, message: 'Choose valid course and instructor records.' })
    const [course, instructor] = await Promise.all([Course.findById(courseId), Instructor.findById(instructorId)])
    if (!course || !instructor || course.department !== department || instructor.department !== department) return res.status(400).json({ success: false, message: 'The lecture, course, and instructor must belong to the same department.' })
    const candidate = { ...existing.toObject(), ...req.body, instructor: instructorId, department }
    if (await hasLectureConflict(candidate, existing._id)) return res.status(409).json({ success: false, message: 'This timetable slot conflicts with another lecture for the instructor or class division.' })
    const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('course', 'code title department').populate('instructor', 'name staffId designation')
    res.json(lecture)
  } catch (error) { next(error) }
}

exports.deleteLecture = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Lecture ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const query = { _id: req.params.id, ...getCourseScope(req.user) }
    const lecture = await Lecture.findOneAndUpdate(query, { active: false }, { new: true })
    if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found.' })
    res.json({ message: 'Lecture removed from the timetable.' })
  } catch (error) { next(error) }
}

const getLectureWithRoster = async (lectureId, user) => {
  const lecture = await Lecture.findOne({ _id: lectureId, ...getCourseScope(user) }).populate('course', 'code title department').populate('instructor', 'name staffId designation')
  if (!lecture) return { lecture: null, students: [] }
  const students = await Student.find({
    program: lecture.program,
    academicYear: lecture.academicYear,
    semester: lecture.semester,
    division: lecture.division,
    $or: [{ department: lecture.department }, { department: { $exists: false }, course: lecture.department }],
  }).sort({ name: 1 })
  return { lecture, students }
}

const getAttendanceDay = (value) => {
  const date = value ? new Date(`${value}T00:00:00.000Z`) : new Date()
  if (Number.isNaN(date.getTime())) return null
  date.setUTCHours(0, 0, 0, 0)
  return date
}

exports.getLectureAttendance = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Lecture ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const date = getAttendanceDay(req.query.date)
    if (!date) return res.status(400).json({ success: false, message: 'Attendance date must be a valid date.' })
    const { lecture, students } = await getLectureWithRoster(req.params.id, req.user)
    if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found.' })
    const records = await Attendance.find({ lecture: lecture._id, date }).populate('student', 'name email program academicYear semester division department course')
    res.json({ lecture, date, students, records })
  } catch (error) { next(error) }
}

exports.saveLectureAttendance = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Lecture ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const date = getAttendanceDay(req.body.date)
    if (!date) return res.status(400).json({ success: false, message: 'Attendance date must be a valid date.' })
    if (!Array.isArray(req.body.records) || req.body.records.length === 0) return res.status(400).json({ success: false, message: 'Provide attendance for at least one student.' })
    const { lecture, students } = await getLectureWithRoster(req.params.id, req.user)
    if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found.' })
    if (['teacher', 'head'].includes(req.user.role) && !(await Course.exists({ _id: lecture.course._id, ...getCourseScope(req.user) }))) return res.status(403).json({ success: false, message: 'You can only manage attendance for your assigned classes.' })
    const rosterIds = new Set(students.map((student) => String(student._id)))
    const submittedIds = new Set()
    for (const record of req.body.records) {
      if (!rosterIds.has(String(record.student))) return res.status(400).json({ success: false, message: 'Attendance can only be recorded for students assigned to this lecture.' })
      if (!['Present', 'Absent', 'Excused'].includes(record.status)) return res.status(400).json({ success: false, message: 'Each attendance status must be Present, Absent, or Excused.' })
      if (submittedIds.has(String(record.student))) return res.status(400).json({ success: false, message: 'A student may only appear once in an attendance submission.' })
      submittedIds.add(String(record.student))
    }
    const saved = await Promise.all(req.body.records.map(({ student, status }) => Attendance.findOneAndUpdate(
      { student, lecture: lecture._id, date },
      { student, course: lecture.course._id, lecture: lecture._id, date, status },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    )))
    res.json({ lecture: lecture._id, date, savedCount: saved.length, records: saved })
  } catch (error) { next(error) }
}

exports.getInternships = async (req, res, next) => {
  try { res.json(await Internship.find().populate('applicants', 'name email program academicYear semester division department').sort({ deadline: 1 })) } catch (error) { next(error) }
}
exports.createInternship = async (req, res, next) => {
  try {
    const internship = new Internship(req.body)
    await internship.save({ runValidators: true })
    res.status(201).json(internship)
  } catch (error) { next(error) }
}
exports.updateInternship = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Internship ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' })
    res.json(internship)
  } catch (error) { next(error) }
}
exports.deleteInternship = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Internship ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const internship = await Internship.findByIdAndDelete(req.params.id)
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' })
    res.json({ message: 'Internship deleted.' })
  } catch (error) { next(error) }
}
exports.applyInternship = async (req, res, next) => {
  try {
    if (req.user.role === 'parent') return res.status(403).json({ success: false, message: 'Only student accounts can apply.' })
    const internship = await Internship.findById(req.params.id)
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' })
    const studentId = req.user.role === 'student' ? req.user.student : req.body.studentId
    if (!studentId) return res.status(400).json({ success: false, message: 'A student record is required.' })
    if (!internship.applicants.some((id) => id.equals(studentId))) internship.applicants.push(studentId)
    await internship.save({ runValidators: true })
    res.json(internship)
  } catch (error) { next(error) }
}

exports.getClubs = async (req, res, next) => {
  try { res.json(await Club.find().populate('lead', 'name').populate('members', 'name email')) } catch (error) { next(error) }
}
exports.createClub = async (req, res, next) => {
  try {
    const club = new Club(req.body)
    await club.save({ runValidators: true })
    res.status(201).json(club)
  } catch (error) { next(error) }
}
exports.updateClub = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Club ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' })
    res.json(club)
  } catch (error) { next(error) }
}
exports.deleteClub = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Club ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const club = await Club.findByIdAndDelete(req.params.id)
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' })
    res.json({ message: 'Club deleted.' })
  } catch (error) { next(error) }
}
exports.joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
    if (!club) return res.status(404).json({ success: false, message: 'Club not found.' })
    const studentId = req.user.role === 'student' ? req.user.student : req.body.studentId
    if (!studentId) return res.status(400).json({ success: false, message: 'A student record is required.' })
    if (!club.members.some((id) => id.equals(studentId))) club.members.push(studentId)
    await club.save({ runValidators: true })
    res.json(club)
  } catch (error) { next(error) }
}

exports.logAttendance = async (req, res, next) => {
  try {
    if (!(await canManageStudentCourse(req.user, req.body.student, req.body.course))) return res.status(403).json({ success: false, message: 'You can only manage attendance for students in your assigned courses.' })
    const entry = await Attendance.findOneAndUpdate(
      { student: req.body.student, course: req.body.course, date: req.body.date || new Date() },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    )
    res.status(201).json(entry)
  } catch (error) { next(error) }
}
exports.updateAttendance = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Attendance ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const existing = await Attendance.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Attendance record not found.' })
    if (!(await canManageStudentCourse(req.user, existing.student, existing.course)) || !(await canManageStudentCourse(req.user, req.body.student || existing.student, req.body.course || existing.course))) return res.status(403).json({ success: false, message: 'You can only manage attendance for students in your assigned courses.' })
    const entry = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!entry) return res.status(404).json({ success: false, message: 'Attendance record not found.' })
    res.json(entry)
  } catch (error) { next(error) }
}
exports.deleteAttendance = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Attendance ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const existing = await Attendance.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Attendance record not found.' })
    if (!(await canManageStudentCourse(req.user, existing.student, existing.course))) return res.status(403).json({ success: false, message: 'You can only manage attendance for students in your assigned courses.' })
    const entry = await Attendance.findByIdAndDelete(req.params.id)
    if (!entry) return res.status(404).json({ success: false, message: 'Attendance record not found.' })
    res.json({ message: 'Attendance record deleted.' })
  } catch (error) { next(error) }
}
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const scope = await getStudentCourseScope(req.user, req.params.id)
    const records = await Attendance.find({ student: req.params.id, ...scope })
      .populate('course', 'code title department')
      .populate('lecture', 'program academicYear semester division department dayOfWeek startTime endTime room')
    const present = records.filter((record) => record.status === 'Present').length
    const percentage = records.length ? (present / records.length) * 100 : 0
    res.json({ percentage: Number(percentage.toFixed(2)), records })
  } catch (error) { next(error) }
}

exports.recordGrade = async (req, res, next) => {
  try {
    if (!(await canManageStudentCourse(req.user, req.body.student, req.body.course))) return res.status(403).json({ success: false, message: 'You can only manage grades for students in your assigned courses.' })
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
exports.updateGrade = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Grade ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const existing = await ExamResult.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Grade record not found.' })
    if (!(await canManageStudentCourse(req.user, existing.student, existing.course)) || !(await canManageStudentCourse(req.user, req.body.student || existing.student, req.body.course || existing.course))) return res.status(403).json({ success: false, message: 'You can only manage grades for students in your assigned courses.' })
    const marksObtained = Number(req.body.marksObtained)
    const maxMarks = Number(req.body.maxMarks ?? 100)
    if (!Number.isFinite(marksObtained) || !Number.isFinite(maxMarks) || marksObtained < 0 || marksObtained > maxMarks || maxMarks < 1) {
      return res.status(400).json({ success: false, message: 'Marks must satisfy 0 <= marksObtained <= maxMarks and maxMarks must be at least 1.' })
    }
    const result = await ExamResult.findByIdAndUpdate(
      req.params.id,
      { ...req.body, marksObtained, maxMarks, grade: getGrade(marksObtained) },
      { new: true, runValidators: true },
    )
    if (!result) return res.status(404).json({ success: false, message: 'Grade record not found.' })
    res.json(result)
  } catch (error) { next(error) }
}
exports.deleteGrade = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Grade ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const existing = await ExamResult.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Grade record not found.' })
    if (!(await canManageStudentCourse(req.user, existing.student, existing.course))) return res.status(403).json({ success: false, message: 'You can only manage grades for students in your assigned courses.' })
    const result = await ExamResult.findByIdAndDelete(req.params.id)
    if (!result) return res.status(404).json({ success: false, message: 'Grade record not found.' })
    res.json({ message: 'Grade record deleted.' })
  } catch (error) { next(error) }
}
exports.getStudentGrades = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.studentId, 'Student ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const scope = await getStudentCourseScope(req.user, req.params.studentId)
    const results = await ExamResult.find({ student: req.params.studentId, ...scope }).populate('course', 'code title department').populate('student', 'name program academicYear semester division department course')
    const totalPoints = results.reduce((sum, result) => sum + ({ O: 10, 'A+': 9, A: 8, B: 7, F: 0 }[result.grade] || 0), 0)
    const gpa = results.length ? totalPoints / results.length : 0
    res.json({ results, gpa: Number(gpa.toFixed(2)), sgpa: Number(gpa.toFixed(2)) })
  } catch (error) { next(error) }
}

exports.getBooks = async (req, res, next) => {
  try { res.json(await Book.find().sort({ title: 1 })) } catch (error) { next(error) }
}
exports.createBook = async (req, res, next) => {
  try {
    const book = new Book(req.body)
    await book.save({ runValidators: true })
    res.status(201).json(book)
  } catch (error) { next(error) }
}
exports.updateBook = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Book ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' })
    res.json(book)
  } catch (error) { next(error) }
}
exports.deleteBook = async (req, res, next) => {
  try {
    const invalid = validateObjectId(req.params.id, 'Book ID')
    if (invalid) return res.status(400).json({ success: false, message: invalid.error })
    const book = await Book.findByIdAndDelete(req.params.id)
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' })
    res.json({ message: 'Book deleted.' })
  } catch (error) { next(error) }
}
exports.issueBook = async (req, res, next) => {
  try {
    if (req.user.role === 'parent') return res.status(403).json({ success: false, message: 'Only student accounts can borrow books.' })
    if (req.user.role === 'student' && String(req.user.student) !== String(req.body.student)) return res.status(403).json({ success: false, message: 'You can only borrow books for your own account.' })
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
    if (req.user.role === 'student' && String(record.student) !== String(req.user.student)) return res.status(403).json({ success: false, message: 'You can only return books borrowed on your account.' })
    await Promise.all([
      BorrowRecord.findByIdAndUpdate(record._id, { returnDate: new Date(), status: 'Returned' }, { runValidators: true }),
      Book.findByIdAndUpdate(record.book, { $inc: { availableCopies: 1 } }, { runValidators: true }),
    ])
    res.json({ message: 'Book returned successfully.' })
  } catch (error) { next(error) }
}
exports.getStudentBorrows = async (req, res, next) => {
  try {
    const scope = await getStudentCourseScope(req.user, req.params.studentId)
    if (scope.course?.$in?.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' })
    const student = await Student.findById(req.params.studentId).select('course')
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' })
    res.json(await BorrowRecord.find({ student: req.params.studentId }).populate('book', 'title isbn'))
  } catch (error) { next(error) }
}
