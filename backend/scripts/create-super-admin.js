require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

async function createSuperAdmin() {
  const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, MONGODB_URI } = process.env
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) throw new Error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD before running this command.')
  await mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1:27017/collegeDB')
  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL.toLowerCase() })
  if (existing) throw new Error('An account with SUPER_ADMIN_EMAIL already exists.')
  await new User({ name: SUPER_ADMIN_NAME || 'Campusdesk Super Admin', email: SUPER_ADMIN_EMAIL, password: SUPER_ADMIN_PASSWORD, role: 'super_admin' }).save()
  console.log(`Created super-admin account for ${SUPER_ADMIN_EMAIL}.`)
}

createSuperAdmin().catch((error) => {
  console.error('Unable to create super-admin:', error.message)
  process.exitCode = 1
}).finally(() => mongoose.disconnect())