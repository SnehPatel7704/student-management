const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/User')

const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'campusdesk-local-development-secret-change-before-deploy')

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null
  if (!token) return res.status(401).json({ success: false, message: 'Authentication is required.' })
  if (!secret) return res.status(503).json({ success: false, message: 'JWT_SECRET must be configured.' })

  try {
    const payload = jwt.verify(token, secret)
    const user = await User.findById(payload.sub)
    if (!user || !user.active) return res.status(401).json({ success: false, message: 'This account is unavailable.' })
    if (user.role === 'dev' || user.developmentAccount) {
      const { roles } = require('../auth/permissions')
      if (process.env.NODE_ENV === 'production' || !roles.includes(payload.devRole)) return res.status(401).json({ success: false, message: 'The development role token is invalid.' })
      user.role = payload.devRole
      if (payload.devDepartment) user.department = payload.devDepartment
      user.developmentContext = true
      if (
        ['student', 'parent'].includes(payload.devRole)
        && mongoose.isValidObjectId(payload.devStudent)
      ) {
        user.student = payload.devStudent
      }
      if (payload.devInstructor && mongoose.isValidObjectId(payload.devInstructor)) user.instructor = payload.devInstructor
      req.isDevUser = true
    } else if (payload.devRole) {
      return res.status(401).json({ success: false, message: 'The development role token is invalid.' })
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, message: 'The authentication token is invalid or expired.' })
  }
}

function authorize(permission) {
  return (req, res, next) => {
    const permissions = require('../auth/permissions')
    if (!req.user || !permissions.hasPermission(req.user.role, permission)) {
      return res.status(403).json({ success: false, message: 'Your role does not have permission to perform this action.' })
    }
    next()
  }
}

module.exports = { authenticate, authorize, tokenSecret: secret }