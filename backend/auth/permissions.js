const rolePermissions = {
  super_admin: ['*'],
  admin: [
    'analytics.read', 'students.read', 'students.manage', 'courses.read', 'courses.manage',
    'instructors.read', 'instructors.manage', 'internships.read', 'internships.manage',
    'internships.apply', 'clubs.read', 'clubs.manage', 'clubs.join', 'attendance.read',
    'attendance.manage', 'grades.read', 'grades.manage', 'library.read', 'library.manage',
    'library.borrow',
  ],
  director: ['analytics.read', 'students.read', 'students.manage', 'courses.read', 'instructors.read', 'internships.read', 'clubs.read', 'attendance.read', 'grades.read', 'library.read'],
  head: ['students.read', 'students.manage', 'courses.read', 'courses.manage', 'instructors.read', 'internships.read', 'clubs.read', 'attendance.read', 'attendance.manage', 'grades.read', 'grades.manage', 'library.read'],
  teacher: ['students.read', 'courses.read', 'instructors.read', 'internships.read', 'clubs.read', 'attendance.read', 'attendance.manage', 'grades.read', 'grades.manage', 'library.read'],
  student: ['portal.read', 'courses.read', 'internships.read', 'internships.apply', 'clubs.read', 'clubs.join', 'library.read', 'library.borrow'],
  parent: ['portal.read', 'courses.read', 'library.read'],
  guest: ['courses.read', 'internships.read', 'clubs.read', 'library.read'],
  dev: [],
}

function getPermissions(role) {
  return rolePermissions[role] || []
}

function hasPermission(role, permission) {
  const permissions = getPermissions(role)
  return permissions.includes('*') || permissions.includes(permission)
}

module.exports = { roles: Object.keys(rolePermissions).filter((role) => role !== 'dev'), getPermissions, hasPermission }