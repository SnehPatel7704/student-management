const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Student = require('../models/Student')
const Course = require('../models/Course')
const Instructor = require('../models/Instructor')
const { getPermissions } = require('../auth/permissions')
const { tokenSecret } = require('../middleware/authenticate')

const publicUser = (user, role = user.role, devUser = false, student = user.student) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role,
  devUser,
  student,
  instructor: user.instructor,
  department: user.department,
  permissions: getPermissions(role),
})

const getDevelopmentStudent = async (user, role) => {
  if (!['student', 'parent'].includes(role)) return user.student
  if (user.student && await Student.exists({ _id: user.student })) return user.student
  const student = await Student.findOne().select('_id').sort({ createdAt: 1 })
  return student?._id
}

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.active || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' })
    }
    if ((user.role === 'dev' || user.developmentAccount) && process.env.NODE_ENV === 'production') return res.status(403).json({ success: false, message: 'Development accounts are disabled in production.' })
    if (!tokenSecret) return res.status(503).json({ success: false, message: 'JWT_SECRET must be configured.' })
    const isDevelopmentAccount = user.role === 'dev' || user.developmentAccount
    const effectiveRole = user.role === 'dev' ? process.env.DEV_DEFAULT_ROLE || 'admin' : user.role
    const developmentStudent = isDevelopmentAccount ? await getDevelopmentStudent(user, effectiveRole) : user.student
    if (isDevelopmentAccount && ['student', 'parent'].includes(effectiveRole) && !developmentStudent) {
      return res.status(409).json({ success: false, message: 'Create at least one student record before using the development student or parent role.' })
    }
    const department = user.department || (['head', 'director'].includes(effectiveRole) ? await Course.distinct('department').then((items) => items[0]) : undefined)
    const token = jwt.sign({
      sub: user._id.toString(),
      ...(isDevelopmentAccount ? {
        devRole: effectiveRole,
        ...(department ? { devDepartment: department } : {}),
        ...(developmentStudent ? { devStudent: developmentStudent.toString() } : {}),
      } : {}),
    }, tokenSecret, { expiresIn: '8h' })
    res.json({ token, user: { ...publicUser(user, effectiveRole, isDevelopmentAccount, developmentStudent), department } })
  } catch (error) { next(error) }
}

exports.me = (req, res) => res.json(publicUser(req.user, req.user.role, Boolean(req.isDevUser)))

exports.switchDevelopmentRole = async (req, res, next) => {
  try {
    const { role, department, student: requestedStudent } = req.body
    const { roles } = require('../auth/permissions')
    if (process.env.NODE_ENV === 'production' || !req.isDevUser) return res.status(403).json({ success: false, message: 'Role switching is available only to development accounts.' })
    if (!roles.includes(role)) return res.status(400).json({ success: false, message: 'Select a valid application role.' })

    let selectedDepartment
    let selectedStudent
    let selectedInstructor

    if (['head', 'director'].includes(role)) {
      if (typeof department !== 'string' || !department.trim()) return res.status(400).json({ success: false, message: 'Choose a department for this role.' })
      const validDepartment = await Course.exists({ department: department.trim() })
      if (!validDepartment) return res.status(400).json({ success: false, message: 'Choose a department with active course records.' })
      selectedDepartment = department.trim()
    }

    if (['student', 'parent'].includes(role)) {
      selectedStudent = requestedStudent && await Student.findById(requestedStudent).select('_id department')
      if (!selectedStudent) selectedStudent = await getDevelopmentStudent(req.user, role).then((id) => id && Student.findById(id).select('_id department'))
      if (!selectedStudent) return res.status(409).json({ success: false, message: 'Create at least one student record before using the development student or parent role.' })
      selectedDepartment = selectedStudent.department
    }

    if (role === 'teacher') {
      selectedInstructor = req.body.instructor && await Instructor.findById(req.body.instructor).select('_id department')
      if (!selectedInstructor) selectedInstructor = await Instructor.findOne().select('_id department').sort({ department: 1 })
      if (!selectedInstructor) return res.status(409).json({ success: false, message: 'Create an instructor record before using the development teacher role.' })
      selectedDepartment = selectedInstructor.department
    }

    const token = jwt.sign({
      sub: req.user._id.toString(),
      devRole: role,
      ...(selectedDepartment ? { devDepartment: selectedDepartment } : {}),
      ...(selectedStudent ? { devStudent: selectedStudent._id.toString() } : {}),
      ...(selectedInstructor ? { devInstructor: selectedInstructor._id.toString() } : {}),
    }, tokenSecret, { expiresIn: '8h' })
    res.json({
      token,
      user: {
        ...publicUser(req.user, role, true, selectedStudent?._id || req.user.student),
        department: selectedDepartment || req.user.department,
        instructor: selectedInstructor?._id || req.user.instructor,
      },
    })
  } catch (error) {
    next(error)
  }
}

exports.getDevelopmentOptions = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' || !req.isDevUser) return res.status(403).json({ success: false, message: 'Development options are only available to development accounts.' })
    const [departments, students, instructors] = await Promise.all([
      Course.distinct('department'),
      Student.find().select('name email department program academicYear semester division').sort({ department: 1, name: 1 }),
      Instructor.find().select('name staffId department designation').sort({ department: 1, name: 1 }),
    ])
    res.json({ departments: departments.sort(), students, instructors })
  } catch (error) { next(error) }
}