require('dotenv').config()
const mongoose = require('mongoose')
const Student = require('./models/Student')
const Course = require('./models/Course')
const Instructor = require('./models/Instructor')
const Internship = require('./models/Internship')
const Attendance = require('./models/Attendance')
const Club = require('./models/Club')
const Book = require('./models/Book')
const BorrowRecord = require('./models/BorrowRecord')
const ExamResult = require('./models/ExamResult')
const Lecture = require('./models/Lecture')
const User = require('./models/User')

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collegeDB'

const studentData = [
  { name: 'Aarav Mehta', email: 'aarav.mehta@campus.edu', course: 'Computer Science', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'A', department: 'Computer Science', age: 20 },
  { name: 'Maya Patel', email: 'maya.patel@campus.edu', course: 'Mechanical Engineering', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'A', department: 'Mechanical Engineering', age: 21 },
  { name: 'Rohan Kapoor', email: 'rohan.kapoor@campus.edu', course: 'Computer Science', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'A', department: 'Computer Science', age: 19 },
  { name: 'Nisha Rao', email: 'nisha.rao@campus.edu', course: 'Electrical Engineering', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'A', department: 'Electrical Engineering', age: 22 },
  { name: 'Dev Malhotra', email: 'dev.malhotra@campus.edu', course: 'Civil Engineering', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'A', department: 'Civil Engineering', age: 21 },
  { name: 'Ananya Singh', email: 'ananya.singh@campus.edu', course: 'Computer Science', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'A', department: 'Computer Science', age: 20 },
  { name: 'Ishita Desai', email: 'ishita.desai@campus.edu', course: 'Computer Science', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'B', department: 'Computer Science', age: 20 },
  { name: 'Kabir Shah', email: 'kabir.shah@campus.edu', course: 'Mechanical Engineering', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'B', department: 'Mechanical Engineering', age: 21 },
  { name: 'Tara Iyer', email: 'tara.iyer@campus.edu', course: 'Electrical Engineering', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'B', department: 'Electrical Engineering', age: 19 },
  { name: 'Arjun Kulkarni', email: 'arjun.kulkarni@campus.edu', course: 'Electrical Engineering', program: 'B.Tech', academicYear: '3rd Year', semester: '5', division: 'A', department: 'Electrical Engineering', age: 21 },
  { name: 'Meera Joshi', email: 'meera.joshi@campus.edu', course: 'Civil Engineering', program: 'B.Tech', academicYear: '2nd Year', semester: '3', division: 'B', department: 'Civil Engineering', age: 20 },
  { name: 'Vihaan Rao', email: 'vihaan.rao@campus.edu', course: 'Civil Engineering', program: 'B.Tech', academicYear: '3rd Year', semester: '5', division: 'A', department: 'Civil Engineering', age: 22 },
]

const instructorData = [
  { staffId: 'INST-001', name: 'Dr. Priya Nair', email: 'priya.nair@campus.edu', department: 'Computer Science', designation: 'Professor' },
  { staffId: 'INST-002', name: 'Mr. Karan Shah', email: 'karan.shah@campus.edu', department: 'Mechanical Engineering', designation: 'Associate Professor' },
  { staffId: 'INST-003', name: 'Dr. Neha Verma', email: 'neha.verma@campus.edu', department: 'Electrical Engineering', designation: 'Senior Lecturer' },
  { staffId: 'INST-004', name: 'Mr. Amit Joshi', email: 'amit.joshi@campus.edu', department: 'Civil Engineering', designation: 'Professor' },
  { staffId: 'INST-005', name: 'Dr. Anika Bose', email: 'anika.bose@campus.edu', department: 'Computer Science', designation: 'Associate Professor' },
  { staffId: 'INST-006', name: 'Mr. Rahul Menon', email: 'rahul.menon@campus.edu', department: 'Mechanical Engineering', designation: 'Senior Lecturer' },
  { staffId: 'INST-007', name: 'Dr. Kavita Deshmukh', email: 'kavita.deshmukh@campus.edu', department: 'Electrical Engineering', designation: 'Associate Professor' },
  { staffId: 'INST-008', name: 'Ms. Sneha Kulkarni', email: 'sneha.kulkarni@campus.edu', department: 'Civil Engineering', designation: 'Assistant Professor' },
  { staffId: 'INST-009', name: 'Dr. Aditya Rao', email: 'aditya.rao@campus.edu', department: 'Computer Science', designation: 'Assistant Professor' },
  { staffId: 'INST-010', name: 'Ms. Pooja Nair', email: 'pooja.nair@campus.edu', department: 'Mechanical Engineering', designation: 'Assistant Professor' },
]

const courseData = [
  { code: 'CSE-301', title: 'Data Structures & Algorithms', department: 'Computer Science', credits: 4, capacity: 40, instructorStaffId: 'INST-001', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', room: 'CS-201' },
  { code: 'CSE-401', title: 'Database Management Systems', department: 'Computer Science', credits: 3, capacity: 35, instructorStaffId: 'INST-001', dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '12:00', room: 'CS-204' },
  { code: 'ME-204', title: 'Thermodynamics', department: 'Mechanical Engineering', credits: 4, capacity: 30, instructorStaffId: 'INST-002', dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '11:00', room: 'ME-105' },
  { code: 'EE-302', title: 'Power Systems', department: 'Electrical Engineering', credits: 4, capacity: 30, instructorStaffId: 'INST-003', dayOfWeek: 'Thursday', startTime: '13:00', endTime: '14:00', room: 'EE-302' },
  { code: 'CE-205', title: 'Structural Analysis', department: 'Civil Engineering', credits: 4, capacity: 30, instructorStaffId: 'INST-004', dayOfWeek: 'Friday', startTime: '09:00', endTime: '10:00', room: 'CE-110' },
  { code: 'CSE-402', title: 'Software Engineering', department: 'Computer Science', credits: 3, capacity: 35, instructorStaffId: 'INST-001', dayOfWeek: 'Thursday', startTime: '10:30', endTime: '11:30', room: 'CS-205' },
  { code: 'ME-305', title: 'Fluid Mechanics', department: 'Mechanical Engineering', credits: 3, capacity: 30, instructorStaffId: 'INST-002', dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '15:00', room: 'ME-208' },
  { code: 'EE-303', title: 'Circuit Analysis', department: 'Electrical Engineering', credits: 3, capacity: 30, instructorStaffId: 'INST-003', dayOfWeek: 'Tuesday', startTime: '15:00', endTime: '16:00', room: 'EE-205' },
  { code: 'CE-306', title: 'Geotechnical Engineering', department: 'Civil Engineering', credits: 3, capacity: 30, instructorStaffId: 'INST-004', dayOfWeek: 'Monday', startTime: '14:00', endTime: '15:00', room: 'CE-210' },
  { code: 'CSE-403', title: 'Operating Systems', department: 'Computer Science', credits: 4, capacity: 40, instructorStaffId: 'INST-005', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '10:00', room: 'CS-206' },
  { code: 'ME-306', title: 'Manufacturing Processes', department: 'Mechanical Engineering', credits: 3, capacity: 30, instructorStaffId: 'INST-006', dayOfWeek: 'Thursday', startTime: '11:00', endTime: '12:00', room: 'ME-210' },
  { code: 'EE-304', title: 'Digital Signal Processing', department: 'Electrical Engineering', credits: 4, capacity: 30, instructorStaffId: 'INST-007', dayOfWeek: 'Friday', startTime: '10:00', endTime: '11:00', room: 'EE-208' },
]

const bookData = [
  { isbn: '978-013516', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest', category: 'Computer Science', totalCopies: 15, availableCopies: 15 },
  { isbn: '978-019507', title: 'Engineering Thermodynamics', author: 'P. K. Nag', category: 'Mechanical Engineering', totalCopies: 15, availableCopies: 15 },
  { isbn: '978-014600', title: 'Power System Analysis', author: 'Gränger & Willsky', category: 'Electrical Engineering', totalCopies: 15, availableCopies: 15 },
  { isbn: '978-014000', title: 'Structural Analysis', author: 'R. C. Hibbeler', category: 'Civil Engineering', totalCopies: 15, availableCopies: 15 },
  { isbn: '978-013407', title: 'Database Systems', author: 'Korth & Silberschatz', category: 'Computer Science', totalCopies: 15, availableCopies: 15 },
  { isbn: '978-013110', title: 'The C Programming Language', author: 'Brian W. Kernighan and Dennis M. Ritchie', category: 'Computer Science', totalCopies: 12, availableCopies: 12 },
  { isbn: '978-032175', title: 'Software Engineering', author: 'Ian Sommerville', category: 'Computer Science', totalCopies: 10, availableCopies: 10 },
  { isbn: '978-007339', title: 'Fundamentals of Thermodynamics', author: 'Michael J. Moran and Howard N. Shapiro', category: 'Mechanical Engineering', totalCopies: 12, availableCopies: 12 },
  { isbn: '978-007338', title: 'Electric Machinery Fundamentals', author: 'Stephen J. Chapman', category: 'Electrical Engineering', totalCopies: 10, availableCopies: 10 },
  { isbn: '978-013602', title: 'Principles of Geotechnical Engineering', author: 'Braja M. Das', category: 'Civil Engineering', totalCopies: 10, availableCopies: 10 },
]

const clubData = [
  { name: 'CodeChef Campus', category: 'Technical', leadStaffId: 'INST-001', memberDepartments: ['Computer Science'] },
  { name: 'Cultural Society', category: 'Cultural', leadStaffId: 'INST-003', memberDepartments: ['all'] },
  { name: 'Athletics Club', category: 'Sports', leadStaffId: 'INST-004', memberDepartments: ['all'] },
  { name: 'Green Campus Collective', category: 'Social', leadStaffId: 'INST-002', memberDepartments: ['all'] },
  { name: 'Robotics and Automation Club', category: 'Technical', leadStaffId: 'INST-005', memberDepartments: ['Computer Science', 'Mechanical Engineering'] },
  { name: 'Electronics Innovation Forum', category: 'Technical', leadStaffId: 'INST-007', memberDepartments: ['Electrical Engineering'] },
  { name: 'Civil Design Society', category: 'Technical', leadStaffId: 'INST-008', memberDepartments: ['Civil Engineering'] },
  { name: 'Literary Circle', category: 'Cultural', leadStaffId: 'INST-009', memberDepartments: ['all'] },
  { name: 'Photography Club', category: 'Cultural', leadStaffId: 'INST-006', memberDepartments: ['all'] },
  { name: 'Community Outreach Team', category: 'Social', leadStaffId: 'INST-010', memberDepartments: ['all'] },
]

const internshipData = [
  { company: 'Nexa Technologies', role: 'Frontend Developer Intern', stipend: 12000, workMode: 'Remote', deadline: new Date('2026-12-15'), applicantDepartments: ['Computer Science'] },
  { company: 'Kinetic Labs', role: 'Mechanical Design Intern', stipend: 15000, workMode: 'Hybrid', deadline: new Date('2026-12-20'), applicantDepartments: ['Mechanical Engineering'] },
  { company: 'VoltGrid Systems', role: 'Power Systems Intern', stipend: 25000, workMode: 'On-site', deadline: new Date('2026-12-30'), applicantDepartments: ['Electrical Engineering'] },
  { company: 'CivicBuild Partners', role: 'Civil Site Engineering Intern', stipend: 18000, workMode: 'Hybrid', deadline: new Date('2026-12-10'), applicantDepartments: ['Civil Engineering'] },
  { company: 'Northstar Digital', role: 'Junior QA Intern', stipend: 10000, workMode: 'Remote', deadline: new Date('2026-08-15'), applicantDepartments: ['Computer Science'] },
  { company: 'Aster Cloud Systems', role: 'Backend Engineering Intern', stipend: 18000, workMode: 'Hybrid', deadline: new Date('2026-11-15'), applicantDepartments: ['Computer Science'] },
  { company: 'ForgeWorks Manufacturing', role: 'Production Engineering Intern', stipend: 16000, workMode: 'On-site', deadline: new Date('2026-11-22'), applicantDepartments: ['Mechanical Engineering'] },
  { company: 'Gridline Energy', role: 'Electrical Design Intern', stipend: 22000, workMode: 'Hybrid', deadline: new Date('2026-11-28'), applicantDepartments: ['Electrical Engineering'] },
  { company: 'UrbanFrame Consultants', role: 'Structural Engineering Intern', stipend: 17000, workMode: 'On-site', deadline: new Date('2026-12-05'), applicantDepartments: ['Civil Engineering'] },
  { company: 'BrightPath Analytics', role: 'Data Analytics Intern', stipend: 14000, workMode: 'Remote', deadline: new Date('2026-12-12'), applicantDepartments: ['Computer Science', 'Electrical Engineering'] },
]

const meetingDatesByDay = {
  Monday: ['2026-10-05', '2026-10-12', '2026-10-19'],
  Tuesday: ['2026-10-06', '2026-10-13', '2026-10-20'],
  Wednesday: ['2026-10-07', '2026-10-14', '2026-10-21'],
  Thursday: ['2026-10-01', '2026-10-08', '2026-10-15'],
  Friday: ['2026-10-02', '2026-10-09', '2026-10-16'],
}

const upsert = async (model, query, data) => model.findOneAndUpdate(
  query,
  data,
  { returnDocument: 'after', upsert: true, runValidators: true },
)

function getGrade(marks) {
  if (marks >= 90) return 'O'
  if (marks >= 85) return 'A+'
  if (marks >= 75) return 'A'
  if (marks >= 65) return 'B'
  return 'F'
}

function getStudentClass(student) {
  const course = student.course.trim()
  const departmentByCourse = {
    BCA: 'Computer Science',
    MCA: 'Computer Science',
    CS101: 'Computer Science',
  }
  const programByCourse = { BCA: 'BCA', MCA: 'MCA' }
  return {
    department: student.department || departmentByCourse[course] || course,
    program: student.program || programByCourse[course] || 'B.Tech',
    academicYear: student.academicYear || '2nd Year',
    semester: student.semester || '3',
    division: student.division || 'A',
  }
}

function addMinutes(time, minutesToAdd) {
  const [hours, minutes] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`
}

async function seed() {
  if (process.env.NODE_ENV === 'production') throw new Error('Sample data cannot be seeded in production.')
  await mongoose.connect(mongoUri)

  const instructors = await Promise.all(instructorData.map((data) => upsert(Instructor, { staffId: data.staffId }, data)))
  const instructorsById = new Map(instructors.map((instructor) => [instructor.staffId, instructor]))
  const courses = await Promise.all(courseData.map(({ instructorStaffId, ...data }) => upsert(
    Course,
    { code: data.code },
    { ...data, instructor: instructorsById.get(instructorStaffId)._id },
  )))
  const coursesByCode = new Map(courses.map((course) => [course.code, course]))
  await Promise.all(studentData.map((data) => upsert(Student, { email: data.email }, data)))
  const existingStudents = await Student.find().sort({ department: 1, program: 1, email: 1 })
  await Promise.all(existingStudents.map((student) => {
    const classDetails = getStudentClass(student)
    return Student.updateOne(
      { _id: student._id },
      { $set: classDetails },
    )
  }))
  const students = await Student.find().sort({ department: 1, program: 1, email: 1 })
  const studentsByEmail = new Map(students.map((student) => [student.email, student]))
  await seedDevelopmentAccounts(studentsByEmail, instructorsById)
  const classGroups = [...new Map(students.map((student) => {
    const key = [student.department, student.program, student.academicYear, student.semester, student.division].join('|')
    return [key, {
      department: student.department,
      program: student.program,
      academicYear: student.academicYear,
      semester: student.semester,
      division: student.division,
    }]
  })).values()]
  const coursesByDepartment = new Map()
  for (const course of courses) {
    if (!coursesByDepartment.has(course.department)) coursesByDepartment.set(course.department, course)
  }

  const lectureRecords = await Promise.all(courseData.flatMap((course) => {
    const linkedCourse = coursesByCode.get(course.code)
    const instructor = instructorsById.get(course.instructorStaffId)
    const departmentGroups = classGroups.filter((group) => group.department === course.department)
    return departmentGroups.map(async (group, groupIndex) => {
      const startTime = addMinutes(course.startTime, groupIndex * 75)
      const endTime = addMinutes(startTime, 60)
      return upsert(
        Lecture,
        {
          course: linkedCourse._id,
          program: group.program,
          academicYear: group.academicYear,
          semester: group.semester,
          division: group.division,
        },
        {
          course: linkedCourse._id,
          instructor: instructor._id,
          department: group.department,
          ...group,
          dayOfWeek: course.dayOfWeek,
          startTime,
          endTime,
          room: course.room,
          active: true,
        },
      )
    })
  }))
  const lectures = lectureRecords.flat()

  const legacyAttendance = await Attendance.find({
    student: { $in: students.map((student) => student._id) },
    lecture: { $exists: false },
  }).populate('student', 'department').populate('course', 'department')
  await Promise.all(legacyAttendance
    .filter((record) => record.student && record.course && record.student.department !== record.course.department)
    .map((record) => {
      const matchingCourse = coursesByDepartment.get(record.student.department)
      return matchingCourse
        ? Attendance.updateOne({ _id: record._id }, { $set: { course: matchingCourse._id } })
        : Promise.resolve()
    }))

  const statuses = ['Present', 'Present', 'Absent', 'Excused']
  await Promise.all(lectures.flatMap((lecture, lectureIndex) => {
    const course = courses.find((item) => item._id.equals(lecture.course))
    const enrolledStudents = students.filter((student) => (
      student.department === lecture.department
      && student.program === lecture.program
      && student.academicYear === lecture.academicYear
      && student.semester === lecture.semester
      && student.division === lecture.division
    ))
    return enrolledStudents.flatMap((student, studentIndex) => meetingDatesByDay[lecture.dayOfWeek].map((date, dateIndex) => {
      const attendanceDate = new Date(`${date}T00:00:00.000Z`)
      const record = {
        student: student._id,
        course: course._id,
        lecture: lecture._id,
        date: attendanceDate,
        status: statuses[(lectureIndex + studentIndex + dateIndex) % statuses.length],
      }
      return upsert(Attendance, { student: student._id, course: course._id, date: attendanceDate }, record)
    }))
  }))

  await Promise.all(students.flatMap((student, studentIndex) => {
    const studentCourses = courses.filter((course) => course.department === student.department)
    return studentCourses.flatMap((course, courseIndex) => ['Midterm', 'Final', 'Practical'].map((examType, examIndex) => {
      const marksObtained = 72 + ((studentIndex * 7 + courseIndex * 5 + examIndex * 9) % 27)
      return upsert(
        ExamResult,
        { student: student._id, course: course._id, examType },
        { student: student._id, course: course._id, examType, marksObtained, maxMarks: 100, grade: getGrade(marksObtained) },
      )
    }))
  }))

  const seededStudentIds = studentData.map((data) => studentsByEmail.get(data.email)._id)
  const oldComputerScienceGrades = await ExamResult.find({
    student: { $in: seededStudentIds },
    course: coursesByCode.get('CSE-301')._id,
  }).populate('student', 'department')
  const misassignedFixtureGrades = oldComputerScienceGrades.filter((record) => (
    record.student && record.student.department !== coursesByCode.get('CSE-301').department
  ))
  if (misassignedFixtureGrades.length) {
    await ExamResult.deleteMany({ _id: { $in: misassignedFixtureGrades.map((record) => record._id) } })
  }

  const books = await Promise.all(bookData.map((data) => upsert(Book, { isbn: data.isbn }, data)))
  const booksByIsbn = new Map(books.map((book) => [book.isbn, book]))
  await Promise.all(clubData.map(({ leadStaffId, memberDepartments, ...data }) => upsert(
    Club,
    { name: data.name },
    {
      ...data,
      lead: instructorsById.get(leadStaffId)._id,
      members: students
        .filter((student) => memberDepartments.includes('all') || memberDepartments.includes(student.department))
        .map((student) => student._id),
    },
  )))

  await Promise.all(internshipData.map(({ applicantDepartments, ...data }) => upsert(
    Internship,
    { company: data.company },
    {
      ...data,
      status: data.deadline > new Date() ? 'Open' : 'Closed',
      applicants: students
        .filter((student) => applicantDepartments.includes(student.department))
        .map((student) => student._id),
    },
  )))

  const bookByDepartment = {
    'Computer Science': ['978-013516', '978-013407'],
    'Mechanical Engineering': ['978-019507'],
    'Electrical Engineering': ['978-014600'],
    'Civil Engineering': ['978-014000'],
  }
  await Promise.all(students.map((student, index) => {
    const departmentBooks = bookByDepartment[student.department] || ['978-013516']
    const book = booksByIsbn.get(departmentBooks[index % departmentBooks.length])
    const borrowDate = new Date(`2026-10-${String(5 + (index % 3) * 2).padStart(2, '0')}T00:00:00.000Z`)
    const returned = index % 3 !== 0
    const dueDate = new Date(borrowDate)
    dueDate.setUTCDate(dueDate.getUTCDate() + 21)
    const borrowRecord = {
      borrowDate,
      dueDate,
      status: returned ? 'Returned' : 'Issued',
      returnDate: returned ? new Date('2026-10-20T00:00:00.000Z') : null,
    }
    return upsert(
      BorrowRecord,
      { student: student._id, book: book._id, borrowDate },
      { ...borrowRecord, student: student._id, book: book._id },
    )
  }))

  await Promise.all(books.map(async (book) => {
    const activeBorrowCount = await BorrowRecord.countDocuments({
      book: book._id,
      status: { $in: ['Issued', 'Overdue'] },
    })
    return Book.updateOne(
      { _id: book._id },
      { $set: { availableCopies: Math.max(0, book.totalCopies - activeBorrowCount) } },
    )
  }))

  const counts = {
    students: await Student.countDocuments(),
    instructors: await Instructor.countDocuments(),
    courses: await Course.countDocuments(),
    lectures: await Lecture.countDocuments(),
    attendance: await Attendance.countDocuments(),
    grades: await ExamResult.countDocuments(),
    books: await Book.countDocuments(),
    borrowRecords: await BorrowRecord.countDocuments(),
    clubs: await Club.countDocuments(),
    internships: await Internship.countDocuments(),
    developmentAccounts: await User.countDocuments({ developmentAccount: true }),
    users: await User.countDocuments(),
  }
  const collectionsBelowMinimum = Object.entries(counts)
    .filter(([collection, count]) => (collection === 'users' ? counts.developmentAccounts : count) < 10)
  if (collectionsBelowMinimum.length) {
    throw new Error(`At least 10 seeded records are required in every collection: ${collectionsBelowMinimum.map(([collection, count]) => `${collection}=${count}`).join(', ')}`)
  }
  console.log('Seed complete:', JSON.stringify(counts))
}

async function seedDevelopmentAccounts(studentsByEmail, instructorsById) {
  const password = process.env.DEV_USER_PASSWORD
  if (!password) {
    console.warn('Development role accounts were skipped; configure DEV_USER_PASSWORD to enable sample logins.')
    return
  }

  const accounts = [
    { role: 'super_admin', name: 'Sample Super Admin', email: 'sample.superadmin@campusdesk.local' },
    { role: 'admin', name: 'Sample Administrator', email: 'sample.admin@campusdesk.local' },
    { role: 'director', name: 'Sample Director', email: 'sample.director@campusdesk.local', department: 'Computer Science' },
    { role: 'head', name: 'Sample Department Head', email: 'sample.head@campusdesk.local', department: 'Computer Science' },
    { role: 'teacher', name: 'Sample Teacher', email: 'sample.teacher@campusdesk.local', instructor: instructorsById.get('INST-001')._id, department: 'Computer Science' },
    { role: 'student', name: 'Sample Student', email: 'sample.student@campusdesk.local', student: studentsByEmail.get('aarav.mehta@campus.edu')._id },
    { role: 'parent', name: 'Sample Parent', email: 'sample.parent@campusdesk.local', student: studentsByEmail.get('aarav.mehta@campus.edu')._id },
    { role: 'guest', name: 'Sample Guest', email: 'sample.guest@campusdesk.local' },
    { role: 'director', name: 'Sample Mechanical Director', email: 'sample.director.mechanical@campusdesk.local', department: 'Mechanical Engineering' },
    { role: 'student', name: 'Sample Student Maya', email: 'sample.student.maya@campusdesk.local', student: studentsByEmail.get('maya.patel@campus.edu')._id },
  ]

  for (const account of accounts) {
    const existing = await User.findOne({ email: account.email })
    if (existing && !existing.developmentAccount) {
      throw new Error(`Cannot seed ${account.email}; an account already exists and is not marked as a development account.`)
    }
    if (existing) {
      Object.assign(existing, account, { active: true, developmentAccount: true })
      await existing.save({ validateModifiedOnly: true })
    } else {
      await new User({ ...account, password, developmentAccount: true, active: true }).save()
    }
  }
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => mongoose.disconnect())
