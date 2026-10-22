require('dotenv').config()
const { randomUUID } = require('node:crypto')

const baseUrl = process.env.BASE_URL || 'http://localhost:5000'
const email = process.env.DEV_USER_EMAIL
const password = process.env.DEV_USER_PASSWORD
const roles = ['super_admin', 'admin', 'director', 'head', 'teacher', 'student', 'parent', 'guest']

async function request(path, method = 'GET', body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return { status: response.status, data: await response.json().catch(() => ({})) }
}

function expectStatus(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: expected HTTP ${expected}, got HTTP ${actual}`)
}

async function main() {
  if (!email || !password) throw new Error('Set DEV_USER_EMAIL and DEV_USER_PASSWORD before running this test.')
  const login = await request('/auth/login', 'POST', { email, password })
  expectStatus(login.status, 200, 'Developer login')
  if (!login.data.user.devUser) throw new Error('The configured login is not a development account.')

  const anonymous = await request('/students')
  expectStatus(anonymous.status, 401, 'Anonymous student access')

  const developmentOptions = await request('/auth/dev-options', 'GET', null, login.data.token)
  expectStatus(developmentOptions.status, 200, 'Development role options')

  const tokens = {}
  for (const role of roles) {
    const context = {}
    if (['director', 'head'].includes(role)) context.department = developmentOptions.data.departments[0]
    if (['student', 'parent'].includes(role)) context.student = developmentOptions.data.students[0]?._id
    if (role === 'teacher') context.instructor = developmentOptions.data.instructors[0]?._id
    const switched = await request('/auth/dev-role', 'POST', { role, ...context }, login.data.token)
    expectStatus(switched.status, 200, `Switch to ${role}`)
    if (switched.data.user.role !== role || !switched.data.user.devUser) throw new Error(`Incorrect effective identity for ${role}`)
    tokens[role] = switched.data.token

    const [courses, students, analytics, users, portal, books] = await Promise.all([
      request('/courses', 'GET', null, tokens[role]),
      request('/students', 'GET', null, tokens[role]),
      request('/students/analytics', 'GET', null, tokens[role]),
      request('/users', 'GET', null, tokens[role]),
      request('/portal', 'GET', null, tokens[role]),
      request('/books', 'POST', {}, tokens[role]),
    ])
    expectStatus(courses.status, 200, `${role} course read`)
    expectStatus(students.status, ['super_admin', 'admin', 'director', 'head', 'teacher'].includes(role) ? 200 : 403, `${role} student read`)
    expectStatus(analytics.status, ['super_admin', 'admin', 'director'].includes(role) ? 200 : 403, `${role} analytics read`)
    expectStatus(users.status, role === 'super_admin' ? 200 : 403, `${role} user administration`)
    expectStatus(portal.status, ['student', 'parent'].includes(role) ? 200 : 403, `${role} linked portal`)
    expectStatus(books.status, ['super_admin', 'admin'].includes(role) ? 400 : 403, `${role} inventory mutation`)
    if (role === 'director') {
      const studentId = students.data.students?.[0]?._id
      const studentEdit = await request(`/students/${studentId || '000000000000000000000000'}`, 'PUT', {}, tokens[role])
      expectStatus(studentEdit.status, studentId ? 200 : 404, 'Director student edit access')
    }
    console.log(`[PASS] ${role} access policy`)
  }

  const adminEmail = `rbac-${randomUUID()}@campusdesk.local`
  const adminPassword = `Temporary-${randomUUID()}!`
  const adminAccount = await request('/users', 'POST', {
    name: 'RBAC Permission Check', email: adminEmail, password: adminPassword, role: 'admin',
  }, tokens.super_admin)
  expectStatus(adminAccount.status, 201, 'Create temporary regular admin')
  if (adminAccount.data.password !== undefined) throw new Error('Account responses must not expose password hashes.')
  try {
    const ordinaryLogin = await request('/auth/login', 'POST', { email: adminEmail, password: adminPassword })
    expectStatus(ordinaryLogin.status, 200, 'Regular admin login')
    const deniedSwitch = await request('/auth/dev-role', 'POST', { role: 'super_admin' }, ordinaryLogin.data.token)
    expectStatus(deniedSwitch.status, 403, 'Ordinary account role switching')
  } finally {
    await request(`/users/${adminAccount.data._id}`, 'DELETE', null, tokens.super_admin)
  }

  console.log('[PASS] ordinary accounts cannot switch roles; user passwords are never returned')
  console.log(`RBAC verification complete: ${roles.length + 2} checks passed.`)
}

main().catch((error) => {
  console.error('RBAC verification failed:', error.message)
  process.exitCode = 1
})
