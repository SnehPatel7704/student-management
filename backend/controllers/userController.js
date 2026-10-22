const User = require('../models/User')
const { roles } = require('../auth/permissions')

exports.list = async (_req, res, next) => {
  try {
    const users = await User.find().populate('student', 'name program academicYear semester division department course').populate('instructor', 'name department designation').sort({ name: 1 })
    res.json({ roles, users })
  } catch (error) { next(error) }
}

exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body)
    await user.save({ runValidators: true })
    res.status(201).json(user)
  } catch (error) { next(error) }
}

exports.update = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+password')
    if (!user) return res.status(404).json({ success: false, message: 'User account not found.' })
    for (const field of ['name', 'email', 'role', 'student', 'instructor', 'department', 'active']) {
      if (req.body[field] !== undefined) user[field] = req.body[field]
    }
    if (req.body.password) user.password = req.body.password
    await user.save({ runValidators: true })
    res.json(user)
  } catch (error) { next(error) }
}

exports.remove = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot delete your own account.' })
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User account not found.' })
    res.json({ message: 'User account deleted.' })
  } catch (error) { next(error) }
}