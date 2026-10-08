const express = require('express')
const controller = require('../controllers/erpController')

const router = express.Router()

router.get('/health', (req, res) => {
  const healthy = req.app.get('mongooseConnection').readyState === 1
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded', database: healthy ? 'connected' : 'disconnected' })
})
router.get('/students', controller.getStudents)
router.get('/students/analytics', controller.getStudentAnalytics)
router.get('/students/:id', controller.getStudent)
router.post('/students', controller.createStudent)
router.put('/students/:id', controller.updateStudent)
router.delete('/students/:id', controller.deleteStudent)
router.post('/students/bulk-delete', controller.bulkDeleteStudents)
router.post('/students/bulk-import', controller.bulkImportStudents)

router.get('/courses', controller.getCourses)
router.post('/courses', controller.createCourse)
router.delete('/courses/:id', controller.deleteCourse)
router.get('/instructors', controller.getInstructors)
router.post('/instructors', controller.createInstructor)
router.delete('/instructors/:id', controller.deleteInstructor)

router.get('/internships', controller.getInternships)
router.post('/internships', controller.createInternship)
router.post('/internships/:id/apply', controller.applyInternship)
router.get('/clubs', controller.getClubs)
router.post('/clubs', controller.createClub)
router.post('/clubs/:id/join', controller.joinClub)

router.post('/attendance', controller.logAttendance)
router.get('/attendance/student/:id', controller.getStudentAttendance)
router.post('/grades', controller.recordGrade)
router.get('/grades/student/:studentId', controller.getStudentGrades)

router.get('/books', controller.getBooks)
router.post('/books', controller.createBook)
router.post('/library/issue', controller.issueBook)
router.post('/library/return/:recordId', controller.returnBook)
router.get('/library/student/:studentId', controller.getStudentBorrows)

module.exports = router
