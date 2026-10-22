import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import CSVImportModal from './components/CSVImportModal'
import DashboardKPIs from './components/DashboardKPIs'
import EntityFormModal from './components/EntityFormModal'
import EntryModal from './components/EntryModal'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import { LectureAttendance, LectureSchedule } from './components/LectureWorkspace'
import PortalView from './components/PortalView'
import { PermissionProvider } from './components/PermissionContext'
import RecordsView from './components/RecordsView'
import StudentDetailsModal from './components/StudentDetailsModal'
import StudentModal from './components/StudentModal'
import StudentTable from './components/StudentTable'
import Toast from './components/Toast'
import UserManagementView from './components/UserManagementView'
import { showToastError, showToastSuccess } from './components/toastHelpers'
import {
  applyInternship,
  bulkDeleteStudents,
  bulkImportStudents,
  createBook,
  createClub,
  createCourse,
  createInstructor,
  createLecture,
  createInternship,
  createStudent,
  deleteAttendance,
  deleteBook,
  deleteClub,
  deleteCourse,
  deleteGrade,
  deleteInstructor,
  deleteLecture,
  deleteInternship,
  deleteStudent,
  fetchBooks,
  fetchClubs,
  fetchCourses,
  fetchCurrentUser,
  fetchDevelopmentOptions,
  fetchHealth,
  fetchInstructors,
  fetchLectures,
  fetchLectureAttendance,
  fetchInternships,
  fetchStudentAnalytics,
  fetchStudentAttendance,
  fetchStudentBorrows,
  fetchStudentGrades,
  fetchStudents,
  fetchPortal,
  fetchUsers,
  issueBook,
  joinClub,
  loginUser,
  logAttendance,
  recordGrade,
  returnBook,
  switchDevelopmentRole,
  updateAttendance,
  updateBook,
  updateClub,
  updateCourse,
  updateGrade,
  updateInstructor,
  updateLecture,
  updateInternship,
  updateStudent,
  saveLectureAttendance,
  createUser,
  updateUser,
  deleteUser,
} from './services/api'

const PAGE_SIZE = 10

function App() {
  const [activeView, setActiveView] = useState('Dashboard')
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(() => !sessionStorage.getItem('campusdesk-token'))
  const [health, setHealth] = useState({ status: 'checking', database: 'checking' })
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [lectures, setLectures] = useState([])
  const [internships, setInternships] = useState([])
  const [clubs, setClubs] = useState([])
  const [books, setBooks] = useState([])
  const [borrows, setBorrows] = useState([])
  const [attendance, setAttendance] = useState([])
  const [grades, setGrades] = useState([])
  const [users, setUsers] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [developmentOptions, setDevelopmentOptions] = useState(null)
  const [portalData, setPortalData] = useState(null)
  const [analytics, setAnalytics] = useState({ courseDistribution: [], ageGroups: [], monthlyEnrollment: [] })
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('All courses')
  const [studentDirectoryFilter, setStudentDirectoryFilter] = useState('all')
  const [sort, setSort] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [entityForm, setEntityForm] = useState(null)
  const [editingEntity, setEditingEntity] = useState(null)
  const [entryForm, setEntryForm] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [studentToView, setStudentToView] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  const hasPermission = (permission) => Boolean(user?.permissions?.includes('*') || user?.permissions?.includes(permission))

  const loadAll = async () => {
    if (!user) return
    setLoading(true)
    try {
      const healthResponse = await fetchHealth()
      setHealth({ status: healthResponse.status, database: healthResponse.database })
      if (['student', 'parent'].includes(user.role)) {
        const portal = await fetchPortal()
        const [coursesResponse, lecturesResponse, internshipResponse, clubResponse, bookResponse] = await Promise.all([
          hasPermission('courses.read') ? fetchCourses() : Promise.resolve([]),
          hasPermission('courses.read') ? fetchLectures() : Promise.resolve([]),
          hasPermission('internships.read') ? fetchInternships() : Promise.resolve([]),
          hasPermission('clubs.read') ? fetchClubs() : Promise.resolve([]),
          hasPermission('library.read') ? fetchBooks() : Promise.resolve([]),
        ])
        setPortalData(portal)
        setStudents([portal.student])
        setAttendance(portal.attendance.map((record) => ({ ...record, student: portal.student._id })))
        setGrades(portal.grades)
        setBorrows(portal.borrows)
        setCourses(coursesResponse)
        setInstructors([])
        setLectures(lecturesResponse)
        setInternships(internshipResponse)
        setClubs(clubResponse)
        setBooks(bookResponse)
        setAnalytics({ courseDistribution: [], ageGroups: [], monthlyEnrollment: [] })
      } else {
        const [studentResponse, coursesResponse, instructorsResponse, lecturesResponse, internshipResponse, clubResponse, bookResponse, analyticsResponse] = await Promise.all([
          hasPermission('students.read') ? fetchStudents() : Promise.resolve({ students: [] }),
          hasPermission('courses.read') ? fetchCourses() : Promise.resolve([]),
          hasPermission('instructors.read') ? fetchInstructors() : Promise.resolve([]),
          hasPermission('courses.read') ? fetchLectures() : Promise.resolve([]),
          hasPermission('internships.read') ? fetchInternships() : Promise.resolve([]),
          hasPermission('clubs.read') ? fetchClubs() : Promise.resolve([]),
          hasPermission('library.read') ? fetchBooks() : Promise.resolve([]),
          hasPermission('analytics.read') ? fetchStudentAnalytics() : Promise.resolve({ courseDistribution: [], ageGroups: [], monthlyEnrollment: [] }),
        ])
        const studentRecords = studentResponse.students || studentResponse
        setStudents(studentRecords)
        setCourses(coursesResponse)
        setInstructors(instructorsResponse)
        setLectures(lecturesResponse)
        setInternships(internshipResponse)
        setClubs(clubResponse)
        setBooks(bookResponse)
        setAnalytics(analyticsResponse)
        const attendanceResponses = hasPermission('attendance.read') ? await Promise.all(studentRecords.slice(0, 20).map((student) => fetchStudentAttendance(student._id))) : []
        const gradeResponses = hasPermission('grades.read') ? await Promise.all(studentRecords.slice(0, 20).map((student) => fetchStudentGrades(student._id))) : []
        const studentBorrowResponses = hasPermission('students.manage') && hasPermission('library.read') ? await Promise.all(studentRecords.slice(0, 20).map((student) => fetchStudentBorrows(student._id))) : []
        setAttendance(attendanceResponses.flatMap((response, index) => (response.records || []).map((record) => ({ ...record, student: studentRecords[index], percentage: response.percentage }))))
        setGrades(gradeResponses.flatMap((response) => response.results || []))
        setBorrows(studentBorrowResponses.flat())
        setPortalData(null)
      }
      if (hasPermission('users.manage')) {
        const userResponse = await fetchUsers()
        setUsers(userResponse.users)
        setUserRoles(userResponse.roles)
      } else {
        setUsers([])
        setUserRoles([])
      }
    } catch (error) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem('campusdesk-token')
        setUser(null)
        return
      }
      setHealth({ status: 'degraded', database: 'disconnected' })
      showToastError(error.response?.data?.message || 'Unable to reach the Campusdesk API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = sessionStorage.getItem('campusdesk-token')
    if (token) fetchCurrentUser().then(setUser).catch(() => sessionStorage.removeItem('campusdesk-token')).finally(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    if (!user?.devUser) return
    fetchDevelopmentOptions()
      .then(setDevelopmentOptions)
      .catch((error) => showToastError(error.response?.data?.message || 'Unable to load development role options'))
  }, [user?.devUser])

  useEffect(() => {
    if (!authReady || !user) return undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll()
    const interval = window.setInterval(() => fetchHealth().then((result) => setHealth({ status: result.status, database: result.database })).catch(() => setHealth({ status: 'degraded', database: 'disconnected' })), 30000)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user])

  const courseOptions = useMemo(() => ['All courses', ...new Set(students.map((student) => student.course).filter(Boolean))], [students])
  const viewPermissions = [
    ['Dashboard', null], ['Students', 'students.read'], ['StudentClasses', 'students.read'], ['Analytics', 'analytics.read'], ['Courses', 'courses.read'],
    ['Instructors', 'instructors.read'], ['Internships', 'internships.read'], ['Attendance', 'attendance.read'],
    ['Clubs', 'clubs.read'], ['Library', 'library.read'], ['Grades', 'grades.read'],
    ['FacultyTimetable', 'instructors.read'], ['CourseSchedules', 'courses.read'],
    ['LectureAttendance', 'attendance.read'], ['InternshipApplications', 'internships.read'],
    ['ClubMemberships', 'clubs.read'], ['GradeSummary', 'grades.read'], ['BorrowingHistory', 'library.read'],
    ['Portal', 'portal.read'], ['Users', 'users.manage'],
  ]
  const availableViews = viewPermissions.filter(([view, permission]) => (
    (view !== 'Portal' || ['student', 'parent'].includes(user?.role))
    && (!permission || hasPermission(permission))
  )).map(([view]) => view)
  const defaultDashboardView = 'Dashboard'
  const currentView = activeView === 'Dashboard'
    ? defaultDashboardView
    : availableViews.includes(activeView)
      ? activeView
      : defaultDashboardView

  const handleLogin = async (credentials) => {
    const result = await loginUser(credentials)
    sessionStorage.setItem('campusdesk-token', result.token)
    setUser(result.user)
    setActiveView('Dashboard')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('campusdesk-token')
    setUser(null)
    setPortalData(null)
    setActiveView('Dashboard')
  }

  const handleRoleChange = async (role, context = {}) => {
    try {
      const result = await switchDevelopmentRole(role, context)
      sessionStorage.setItem('campusdesk-token', result.token)
      setUser(result.user)
      setActiveView('Dashboard')
      showToastSuccess(`Development role changed to ${role.replaceAll('_', ' ')}`)
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to switch development role')
    }
  }

  const createAccount = async (payload) => {
    await createUser(payload)
    showToastSuccess('Account created')
    await loadAll()
  }

  const changeAccountRole = async (id, payload) => {
    try {
      await updateUser(id, payload)
      showToastSuccess(payload.active !== undefined ? 'Account status updated' : 'Role updated')
      await loadAll()
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to update role')
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = students.filter((student) => {
      const matchesSearch = !query || [student.name, student.email, student.course, student.program, student.academicYear, student.semester, student.division, student.department].some((value) => value?.toLowerCase().includes(query))
      const matchesCourse = selectedCourse === 'All courses' || student.course === selectedCourse
      const hasClassDetails = Boolean(student.program && student.academicYear && student.semester && student.division && (student.department || student.course))
      const matchesClass = studentDirectoryFilter !== 'unassigned' || !hasClassDetails
      return matchesSearch && matchesCourse && matchesClass
    })
    return [...items].sort((left, right) => {
      if (sort === 'age-asc') return Number(left.age) - Number(right.age)
      if (sort === 'age-desc') return Number(right.age) - Number(left.age)
      if (sort === 'name-asc') return left.name.localeCompare(right.name)
      if (sort === 'name-desc') return right.name.localeCompare(left.name)
      return new Date(right.createdAt) - new Date(left.createdAt)
    })
  }, [search, selectedCourse, sort, studentDirectoryFilter, students])
  const pageStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const saveStudent = async (payload) => {
    try {
      if (editingStudent) {
        const updated = await updateStudent(editingStudent._id, payload)
        setStudents((current) => current.map((student) => student._id === updated._id ? updated : student))
        showToastSuccess('Student record updated')
      } else {
        const created = await createStudent(payload)
        setStudents((current) => [created, ...current])
        showToastSuccess('Student added to the directory')
      }
      setFormOpen(false)
      setEditingStudent(null)
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to save student')
      throw error
    }
  }

  const confirmDelete = async () => {
    const ids = studentToDelete.map((student) => student._id)
    try {
      if (ids.length > 1) await bulkDeleteStudents(ids)
      else await deleteStudent(ids[0])
      setStudents((current) => current.filter((student) => !ids.includes(student._id)))
      setSelectedIds((current) => new Set([...current].filter((id) => !ids.includes(id))))
      setStudentToDelete(null)
      showToastSuccess(`${ids.length} student record${ids.length === 1 ? '' : 's'} deleted`)
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to delete students')
    }
  }

  const exportCsv = () => {
    const fields = ['name', 'email', 'course', 'program', 'department', 'academicYear', 'semester', 'division', 'age']
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csv = [fields.join(','), ...filteredStudents.map((student) => fields.map((field) => escape(student[field])).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'campus-students.csv'
    link.click()
    URL.revokeObjectURL(url)
    showToastSuccess('CSV export downloaded')
  }

  const importStudents = async (rows) => {
    const response = await bulkImportStudents({ students: rows })
    showToastSuccess(`${response.insertedCount} records imported; ${response.failedCount} failed`)
    await loadAll()
  }

  const createEntity = async (payload) => {
    const createServices = {
      course: createCourse,
      instructor: createInstructor,
      lecture: createLecture,
      internship: createInternship,
      club: createClub,
      book: createBook,
    }
    const updateServices = {
      course: updateCourse,
      instructor: updateInstructor,
      lecture: updateLecture,
      internship: updateInternship,
      club: updateClub,
      book: updateBook,
    }
    const service = editingEntity ? updateServices[entityForm] : createServices[entityForm]
    if (!service) throw new Error('Select a valid entity type.')
    if (editingEntity) await service(editingEntity._id, payload)
    else await service(payload)
    showToastSuccess(editingEntity ? 'Record updated successfully' : 'Record created successfully')
    await loadAll()
  }

  const loadGrades = async () => {
    if (!students.length) return
    const results = await Promise.all(students.map((student) => fetchStudentGrades(student._id)))
    setGrades(results.flatMap((response) => response.results || []))
  }

  const handleRecordGrade = async (payload, existingRecord = editingEntry) => {
    try {
      if (existingRecord) await updateGrade(existingRecord._id, payload)
      else await recordGrade(payload)
      showToastSuccess(existingRecord ? 'Grade updated' : 'Grade recorded')
      await loadGrades()
      setEditingEntry(null)
      setEntryForm(null)
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to record grade')
      throw error
    }
  }

  const handleLogAttendance = async (payload, existingRecord = editingEntry) => {
    try {
      if (existingRecord) await updateAttendance(existingRecord._id, payload)
      else await logAttendance(payload)
      showToastSuccess(existingRecord ? 'Attendance updated' : 'Attendance entry saved')
      await loadAll()
      setEditingEntry(null)
      setEntryForm(null)
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to log attendance')
      throw error
    }
  }

  const loadLectureRoster = (lectureId, date) => fetchLectureAttendance(lectureId, date)

  const saveLectureRoster = async (lectureId, payload) => {
    await saveLectureAttendance(lectureId, payload)
    showToastSuccess('Lecture attendance saved')
    await loadAll()
  }

  const removeRecord = async () => {
    const deleteServices = {
      attendance: deleteAttendance,
      lecture: deleteLecture,
      book: deleteBook,
      club: deleteClub,
      course: deleteCourse,
      grade: deleteGrade,
      instructor: deleteInstructor,
      internship: deleteInternship,
      user: deleteUser,
    }
    try {
      await deleteServices[pendingDelete.kind](pendingDelete.id)
      showToastSuccess(`${pendingDelete.type} deleted`)
      setPendingDelete(null)
      await loadAll()
    } catch (error) {
      showToastError(error.response?.data?.message || `Unable to delete ${pendingDelete.type.toLowerCase()}`)
    }
  }

  const handleIssueBook = async (bookId) => {
    try {
      const student = students[0]
      if (!student) throw new Error('No student is available to issue this book')
      await issueBook({ book: bookId, student: student._id, dueDate: new Date(Date.now() + 14 * 86400000).toISOString() })
      showToastSuccess('Book issued')
      await loadAll()
    } catch (error) {
      showToastError(error.response?.data?.message || error.message || 'Unable to issue book')
    }
  }

  const handleReturnBook = async (recordId) => {
    try {
      await returnBook(recordId)
      showToastSuccess('Book returned')
      await loadAll()
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to return book')
    }
  }

  const handleApply = async (id) => {
    try {
      const studentId = students[0]?._id
      if (!studentId) throw new Error('No student is available to apply')
      await applyInternship(id, studentId)
      showToastSuccess('Application submitted')
      await loadAll()
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to apply')
    }
  }

  const handleJoin = async (id) => {
    try {
      const studentId = students[0]?._id
      if (!studentId) throw new Error('No student is available to join')
      await joinClub(id, studentId)
      showToastSuccess('Membership updated')
      await loadAll()
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to join club')
    }
  }

  const handleHeaderAction = (action) => {
    if (action.startsWith('focus:')) {
      const targetId = action.slice('focus:'.length)
      if (targetId === 'students-directory') setStudentDirectoryFilter('all')
      window.setTimeout(() => {
        const target = document.getElementById(targetId)
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (targetId === 'user-account-form') {
          target?.querySelector('input')?.focus({ preventScroll: true })
        }
      }, 100)
      return
    }

    const actions = {
      'students.filter.unassigned': () => setStudentDirectoryFilter('unassigned'),
      'students.create': () => {
        if (!hasPermission('students.manage')) return
        setEditingStudent(null)
        setFormOpen(true)
      },
      'students.import': () => {
        if (!hasPermission('students.manage')) return
        setImportOpen(true)
      },
      'courses.create': () => {
        if (!hasPermission('courses.manage')) return
        setEditingEntity(null)
        setEntityForm('course')
      },
      'instructors.create': () => {
        if (!hasPermission('instructors.manage')) return
        setEditingEntity(null)
        setEntityForm('instructor')
      },
      'lectures.create': () => {
        if (!hasPermission('courses.manage')) return
        setEditingEntity(null)
        setEntityForm('lecture')
      },
      'internships.create': () => {
        if (!hasPermission('internships.manage')) return
        setEditingEntity(null)
        setEntityForm('internship')
      },
      'clubs.create': () => {
        if (!hasPermission('clubs.manage')) return
        setEditingEntity(null)
        setEntityForm('club')
      },
      'attendance.create': () => {
        if (!hasPermission('attendance.manage')) return
        setEditingEntry(null)
        setEntryForm('attendance')
      },
      'grades.create': () => {
        if (!hasPermission('grades.manage')) return
        setEditingEntry(null)
        setEntryForm('grade')
      },
      'library.create': () => {
        if (!hasPermission('library.manage')) return
        setEditingEntity(null)
        setEntityForm('book')
      },
    }

    actions[action]?.()
  }

  const renderView = () => {
    if (currentView === 'Dashboard') {
      if (['student', 'parent'].includes(user.role)) return <PortalView data={portalData} user={user} />
      const shortcuts = [
        ['Students', 'Student directory'], ['Courses', 'Course catalog'], ['Instructors', 'Faculty directory'],
        ['CourseSchedules', 'Class schedules'], ['Attendance', 'Attendance history'], ['Grades', 'Academic results'],
        ['Internships', 'Internship opportunities'], ['Clubs', 'Student clubs'], ['Library', 'Library catalog'],
      ].filter(([view]) => availableViews.includes(view))
      return <section className="space-y-6">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-800">Campusdesk workspace</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h1><p className="mt-1 text-xs text-slate-500">Choose a module to open its own workspace.</p></div>
        <DashboardKPIs students={students} apiStatus={health.status === 'ok' ? 'connected' : 'error'} databaseStatus={health.database} />
        {hasPermission('analytics.read') && <AnalyticsDashboard data={analytics} />}
        <nav aria-label="Dashboard module shortcuts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map(([view, label]) => <button className="rounded-xl border border-slate-200 bg-white p-4 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-cyan-700 hover:text-cyan-900" key={view} onClick={() => setActiveView(view)} type="button">{label}<span className="mt-1 block text-xs font-normal text-slate-500">Open {label.toLowerCase()}</span></button>)}
        </nav>
      </section>
    }
    if (currentView === 'FacultyTimetable' || currentView === 'CourseSchedules') {
      return <LectureSchedule lectures={lectures} canManage={hasPermission('courses.manage')} onCreate={() => { setEditingEntity(null); setEntityForm('lecture') }} onEdit={(lecture) => { setEditingEntity(lecture); setEntityForm('lecture') }} onDelete={(lecture) => setPendingDelete({ kind: 'lecture', type: 'lecture schedule', id: lecture._id, label: `${lecture.course?.code || 'Course'} · ${lecture.dayOfWeek} ${lecture.startTime}` })} />
    }
    if (currentView === 'LectureAttendance') {
      return <LectureAttendance lectures={lectures} canManage={hasPermission('attendance.manage')} onLoadAttendance={loadLectureRoster} onSaveAttendance={saveLectureRoster} />
    }
    if (currentView === 'Courses') {
      return <RecordsView title="Course catalog" description="Courses grouped by department, with assigned faculty and academic details." records={courses} createLabel="Add course" onCreate={() => { setEditingEntity(null); setEntityForm('course') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('course') }} onDelete={(record) => setPendingDelete({ kind: 'course', type: 'course', id: record._id, label: record.code })} columns={[{ label: 'Code', render: (record) => record.code }, { label: 'Course', render: (record) => record.title }, { label: 'Department', render: (record) => record.department }, { label: 'Credits', render: (record) => record.credits }, { label: 'Capacity', render: (record) => record.capacity }, { label: 'Instructor', render: (record) => record.instructor?.name || 'Unassigned' }]} />
    }
    if (currentView === 'Instructors') {
      return <RecordsView title="Faculty roster" description="Faculty grouped by department and designation, with contact details." records={instructors} createLabel="Add instructor" onCreate={() => { setEditingEntity(null); setEntityForm('instructor') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('instructor') }} onDelete={(record) => setPendingDelete({ kind: 'instructor', type: 'instructor', id: record._id, label: record.name })} columns={[{ label: 'Name', render: (record) => record.name }, { label: 'Staff ID', render: (record) => record.staffId }, { label: 'Department', render: (record) => record.department }, { label: 'Role', render: (record) => record.designation }, { label: 'Email', render: (record) => record.email }]} />
    }
    if (currentView === 'Attendance') {
      return <RecordsView title="Attendance register" description="Lecture attendance records grouped by class and course." records={attendance} createLabel="Log attendance" onCreate={() => { setEditingEntry(null); setEntryForm('attendance') }} onEdit={(record) => { setEditingEntry(record); setEntryForm('attendance') }} onDelete={(record) => { const student = students.find((item) => item._id === record.student?._id || item._id === record.student); setPendingDelete({ kind: 'attendance', type: 'attendance record', id: record._id, label: `${student?.name || 'Student'} · ${new Date(record.date).toLocaleDateString()}` }) }} columns={[{ label: 'Student', render: (record) => record.student?.name || students.find((student) => student._id === record.student)?.name || 'Student' }, { label: 'Course', render: (record) => record.course?.code || courses.find((course) => course._id === record.course)?.code || 'Course' }, { label: 'Lecture', render: (record) => record.lecture ? `${record.lecture.dayOfWeek} · ${record.lecture.startTime} · Div ${record.lecture.division}` : 'Legacy daily entry' }, { label: 'Date', render: (record) => new Date(record.date).toLocaleDateString() }, { label: 'Status', render: (record) => record.status }]} />
    }
    if (currentView === 'Internships') {
      return <RecordsView title="Internship opportunities" description="Opportunities grouped by company, with deadlines, applicant records, and status." records={internships} createLabel="Post opportunity" onCreate={() => { setEditingEntity(null); setEntityForm('internship') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('internship') }} onDelete={(record) => setPendingDelete({ kind: 'internship', type: 'internship', id: record._id, label: `${record.role} at ${record.company}` })} extraActions={user.role === 'student' ? (record) => <button onClick={() => handleApply(record._id)} disabled={record.status === 'Closed'} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-cyan-800 hover:bg-cyan-50 disabled:opacity-40" type="button">Apply</button> : undefined} extraPermission="internships.apply" columns={[{ label: 'Role', render: (record) => record.role }, { label: 'Company', render: (record) => record.company }, { label: 'Stipend', render: (record) => `$${record.stipend || 0}/month` }, { label: 'Mode', render: (record) => record.workMode }, { label: 'Deadline', render: (record) => new Date(record.deadline).toLocaleDateString() }, { label: 'Applicants', render: (record) => <span title={record.applicants?.map((applicant) => applicant.name).join(', ')}>{record.applicants?.length || 0}{record.applicants?.length ? ` · ${record.applicants.slice(0, 2).map((applicant) => applicant.name).join(', ')}` : ''}</span> }, { label: 'Status', render: (record) => record.status }]} />
    }
    if (currentView === 'Clubs') {
      return <RecordsView title="Club directory" description="Clubs grouped by category, with coordinators and current membership." records={clubs} createLabel="Create club" onCreate={() => { setEditingEntity(null); setEntityForm('club') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('club') }} onDelete={(record) => setPendingDelete({ kind: 'club', type: 'club', id: record._id, label: record.name })} extraActions={user.role === 'student' ? (record) => <button onClick={() => handleJoin(record._id)} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-cyan-800 hover:bg-cyan-50" type="button">Join</button> : undefined} extraPermission="clubs.join" columns={[{ label: 'Club', render: (record) => record.name }, { label: 'Category', render: (record) => record.category }, { label: 'Coordinator', render: (record) => record.lead?.name || 'Unassigned' }, { label: 'Members', render: (record) => <span title={record.members?.map((member) => member.name).join(', ')}>{record.members?.length || 0}{record.members?.length ? ` · ${record.members.slice(0, 3).map((member) => member.name).join(', ')}` : ''}</span> }]} />
    }
    if (currentView === 'InternshipApplications') {
      const applications = internships.filter((internship) => internship.applicants?.length)
      return <RecordsView title="Internship applications" description="Applicants by opportunity, employer, deadline, and application status." records={applications} columns={[{ label: 'Company', render: (record) => record.company }, { label: 'Role', render: (record) => record.role }, { label: 'Applicants', render: (record) => record.applicants.map((applicant) => applicant.name).join(', ') }, { label: 'Deadline', render: (record) => new Date(record.deadline).toLocaleDateString() }, { label: 'Status', render: (record) => record.status }]} />
    }
    if (currentView === 'ClubMemberships') {
      const clubsWithMembers = clubs.filter((club) => club.members?.length)
      return <RecordsView title="Club memberships" description="Member rosters grouped by club and activity category." records={clubsWithMembers} columns={[{ label: 'Club', render: (record) => record.name }, { label: 'Category', render: (record) => record.category }, { label: 'Coordinator', render: (record) => record.lead?.name || 'Unassigned' }, { label: 'Members', render: (record) => record.members.map((member) => member.name).join(', ') }]} />
    }
    if (currentView === 'GradeSummary') {
      const gradeCounts = grades.reduce((counts, record) => {
        counts[record.grade] = (counts[record.grade] || 0) + 1
        return counts
      }, {})
      return <section className="space-y-5">
        <div><h1 className="text-xl font-bold text-slate-900">Grade summaries</h1><p className="mt-1 text-xs text-slate-500">Grade distribution for the records available to your role.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{['O', 'A+', 'A', 'B', 'F'].map((grade) => <article className="rounded-xl border border-slate-200 bg-white p-4" key={grade}><p className="text-xs font-semibold text-slate-500">Grade {grade}</p><p className="mt-2 text-2xl font-bold text-slate-900">{gradeCounts[grade] || 0}</p></article>)}</div>
        <RecordsView title="Results by course and class" description="Individual results used in the grade summary." records={grades} columns={[{ label: 'Student', render: (record) => record.student?.name || 'Student' }, { label: 'Course', render: (record) => record.course?.code || 'Course' }, { label: 'Class', render: (record) => [record.student?.program || record.student?.course, record.student?.academicYear, record.student?.division && `Div ${record.student.division}`].filter(Boolean).join(' · ') || 'Unassigned' }, { label: 'Exam', render: (record) => record.examType }, { label: 'Marks', render: (record) => `${record.marksObtained}/${record.maxMarks}` }, { label: 'Grade', render: (record) => record.grade }]} />
      </section>
    }
    if (currentView === 'BorrowingHistory') {
      const canReturnBooks = hasPermission('library.borrow') || hasPermission('library.manage')
      return <RecordsView title="Borrowing history" description="Library loans, due dates, returns, and current status." records={borrows} extraPermission={['library.borrow', 'library.manage']} extraActions={canReturnBooks ? (record) => record.status !== 'Returned' && <button className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700" onClick={() => handleReturnBook(record._id)} type="button">Return</button> : undefined} columns={[{ label: 'Student', render: (record) => students.find((student) => student._id === (record.student?._id || record.student))?.name || 'Student' }, { label: 'Book', render: (record) => record.book?.title || 'Book' }, { label: 'Borrowed', render: (record) => record.borrowDate ? new Date(record.borrowDate).toLocaleDateString() : '—' }, { label: 'Due', render: (record) => new Date(record.dueDate).toLocaleDateString() }, { label: 'Returned', render: (record) => record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '—' }, { label: 'Status', render: (record) => record.status }]} />
    }
    if (currentView === 'Library') {
      const canBorrowForSelf = user.role === 'student'
      return <RecordsView title="Library inventory" description="Books grouped by subject category and availability. Borrowing history is available on its own page." records={books} createLabel="Add book" onCreate={() => { setEditingEntity(null); setEntityForm('book') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('book') }} onDelete={(record) => setPendingDelete({ kind: 'book', type: 'book', id: record._id, label: record.title })} extraActions={canBorrowForSelf ? (record) => <button onClick={() => handleIssueBook(record._id)} disabled={record.availableCopies < 1} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-cyan-800 hover:bg-cyan-50 disabled:opacity-40" type="button">Borrow</button> : undefined} extraPermission="library.borrow" columns={[{ label: 'Title', render: (record) => record.title }, { label: 'Author', render: (record) => record.author }, { label: 'Category', render: (record) => record.category }, { label: 'ISBN', render: (record) => record.isbn }, { label: 'Copies', render: (record) => `${record.availableCopies}/${record.totalCopies}` }]} />
    }
    if (currentView === 'Grades') {
      return <RecordsView title="Academic performance" description="Results grouped by course; each grade is tied to a student and exam." records={grades} createLabel="Record grade" onCreate={() => { setEditingEntry(null); setEntryForm('grade') }} onEdit={(record) => { setEditingEntry(record); setEntryForm('grade') }} onDelete={(record) => { const student = students.find((item) => item._id === (record.student?._id || record.student)); setPendingDelete({ kind: 'grade', type: 'grade record', id: record._id, label: `${student?.name || record.student?.name || 'Student'} · ${record.examType}` }) }} columns={[{ label: 'Student', render: (record) => record.student?.name || students.find((student) => student._id === record.student)?.name || 'Student' }, { label: 'Class', render: (record) => record.student ? [record.student.program || record.student.course, record.student.academicYear, record.student.semester, record.student.division && `Div ${record.student.division}`].filter(Boolean).join(' · ') : 'Class unassigned' }, { label: 'Course', render: (record) => record.course?.code || courses.find((course) => course._id === record.course)?.code || 'Course' }, { label: 'Exam', render: (record) => record.examType }, { label: 'Marks', render: (record) => `${record.marksObtained}/${record.maxMarks}` }, { label: 'Grade', render: (record) => record.grade }]} />
    }
    switch (currentView) {
      case 'Analytics': return <AnalyticsDashboard data={analytics} />
      case 'Portal': return <PortalView data={portalData} user={user} />
      case 'Users': return <UserManagementView users={users} roles={userRoles} students={students} instructors={instructors} currentUser={user} onCreate={createAccount} onUpdate={changeAccountRole} onDelete={(account) => setPendingDelete({ kind: 'user', type: 'user account', id: account._id, label: account.email })} />
      case 'Courses': return <RecordsView title="Course catalog" description="Academic programs, capacity, and faculty ownership." records={courses} createLabel="Add course" onCreate={() => { setEditingEntity(null); setEntityForm('course') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('course') }} onDelete={(record) => setPendingDelete({ kind: 'course', type: 'course', id: record._id, label: record.code })} columns={[{ label: 'Code', render: (record) => record.code }, { label: 'Course', render: (record) => record.title }, { label: 'Department', render: (record) => record.department }, { label: 'Credits', render: (record) => record.credits }, { label: 'Capacity', render: (record) => record.capacity }, { label: 'Instructor', render: (record) => record.instructor?.name || 'Unassigned' }]} />
      case 'Instructors': return <RecordsView title="Faculty roster" description="Departments and institutional contact details." records={instructors} createLabel="Add instructor" onCreate={() => { setEditingEntity(null); setEntityForm('instructor') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('instructor') }} onDelete={(record) => setPendingDelete({ kind: 'instructor', type: 'instructor', id: record._id, label: record.name })} columns={[{ label: 'Name', render: (record) => record.name }, { label: 'Staff ID', render: (record) => record.staffId }, { label: 'Department', render: (record) => record.department }, { label: 'Designation', render: (record) => record.designation }, { label: 'Email', render: (record) => record.email }]} />
      case 'Internships': return <RecordsView title="Internship opportunities" description="Placement roles, application status, and deadlines." records={internships} createLabel="Post opportunity" onCreate={() => { setEditingEntity(null); setEntityForm('internship') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('internship') }} onDelete={(record) => setPendingDelete({ kind: 'internship', type: 'internship', id: record._id, label: `${record.role} at ${record.company}` })} extraActions={(record) => <button onClick={() => handleApply(record._id)} disabled={record.status === 'Closed'} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-cyan-800 hover:bg-cyan-50 disabled:opacity-40" type="button">Apply</button>} columns={[{ label: 'Company', render: (record) => record.company }, { label: 'Role', render: (record) => record.role }, { label: 'Stipend', render: (record) => `$${record.stipend || 0}/month` }, { label: 'Mode', render: (record) => record.workMode }, { label: 'Deadline', render: (record) => new Date(record.deadline).toLocaleDateString() }, { label: 'Applicants', render: (record) => record.applicants?.length || 0 }, { label: 'Status', render: (record) => record.status }]} />
      case 'Attendance': return <RecordsView title="Attendance register" description="Daily class attendance and performance thresholds." records={attendance} createLabel="Log attendance" onCreate={() => { setEditingEntry(null); setEntryForm('attendance') }} onEdit={(record) => { setEditingEntry(record); setEntryForm('attendance') }} onDelete={(record) => { const student = students.find((item) => item._id === record.student); setPendingDelete({ kind: 'attendance', type: 'attendance record', id: record._id, label: `${student?.name || 'Student'} · ${new Date(record.date).toLocaleDateString()}` }) }} columns={[{ label: 'Student', render: (record) => students.find((student) => student._id === (record.student?._id || record.student))?.name || 'Student' }, { label: 'Course', render: (record) => courses.find((course) => course._id === (record.course?._id || record.course))?.code || 'Course' }, { label: 'Date', render: (record) => new Date(record.date).toLocaleDateString() }, { label: 'Status', render: (record) => record.status }, { label: 'Attendance', render: (record) => `${record.percentage ?? 0}%` }]} />
      case 'Clubs': return <RecordsView title="Club directory" description="Student communities, coordinators, and membership." records={clubs} createLabel="Create club" onCreate={() => { setEditingEntity(null); setEntityForm('club') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('club') }} onDelete={(record) => setPendingDelete({ kind: 'club', type: 'club', id: record._id, label: record.name })} extraActions={(record) => <button onClick={() => handleJoin(record._id)} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-cyan-800 hover:bg-cyan-50" type="button">Join</button>} columns={[{ label: 'Club', render: (record) => record.name }, { label: 'Category', render: (record) => record.category }, { label: 'Coordinator', render: (record) => record.lead?.name || 'Unassigned' }, { label: 'Members', render: (record) => record.members?.length || 0 }]} />
      case 'Library': return <RecordsView title="Library inventory" description="Manage titles, authors, categories, and available copies." records={books} createLabel="Add book" onCreate={() => { setEditingEntity(null); setEntityForm('book') }} onEdit={(record) => { setEditingEntity(record); setEntityForm('book') }} onDelete={(record) => setPendingDelete({ kind: 'book', type: 'book', id: record._id, label: record.title })} extraActions={(record) => <button onClick={() => handleIssueBook(record._id)} disabled={record.availableCopies < 1} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-cyan-800 hover:bg-cyan-50 disabled:opacity-40" type="button">Issue</button>} footer={<section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Borrowing history</h2><div className="mt-3 space-y-2">{borrows.length ? borrows.map((record) => <div className="flex items-center justify-between gap-3 border-t border-slate-100 py-2 text-xs" key={record._id}><span>{record.book?.title || 'Book'} · {record.status}</span>{record.status === 'Issued' && <button className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700" onClick={() => handleReturnBook(record._id)} type="button">Return</button>}</div>) : <p className="text-xs text-slate-500">No checkouts found.</p>}</div></section>} columns={[{ label: 'Title', render: (record) => record.title }, { label: 'Author', render: (record) => record.author }, { label: 'Category', render: (record) => record.category }, { label: 'ISBN', render: (record) => record.isbn }, { label: 'Copies', render: (record) => `${record.availableCopies}/${record.totalCopies}` }]} />
      case 'Grades': return <RecordsView title="Academic performance" description="Marks, letter grades, and student GPA report cards." records={grades} createLabel="Record grade" onCreate={() => { setEditingEntry(null); setEntryForm('grade') }} onEdit={(record) => { setEditingEntry(record); setEntryForm('grade') }} onDelete={(record) => { const student = students.find((item) => item._id === (record.student?._id || record.student)); setPendingDelete({ kind: 'grade', type: 'grade record', id: record._id, label: `${student?.name || 'Student'} · ${record.examType}` }) }} columns={[{ label: 'Student', render: (record) => students.find((student) => student._id === (record.student?._id || record.student))?.name || 'Student' }, { label: 'Course', render: (record) => courses.find((course) => course._id === (record.course?._id || record.course))?.code || record.course?.code || 'Course' }, { label: 'Exam', render: (record) => record.examType }, { label: 'Marks', render: (record) => `${record.marksObtained}/${record.maxMarks}` }, { label: 'Grade', render: (record) => record.grade }]} />
      default: return (
        <section className="space-y-5" id="students-directory">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-800">Academic registration</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Student management</h1><p className="mt-1 text-xs text-slate-500">Manage enrollment records, course assignments, and student details.</p></div>{hasPermission('students.manage') && <div className="flex gap-2"><button onClick={() => { setEditingStudent(null); setFormOpen(true) }} className="rounded-lg bg-cyan-900 px-4 py-2 text-xs font-semibold text-white">Add student</button><button onClick={() => setImportOpen(true)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">Import CSV</button></div>}</div>
          <DashboardKPIs students={students} apiStatus={health.status === 'ok' ? 'connected' : 'error'} databaseStatus={health.database} />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <StudentTable students={pageStudents} loading={loading} page={page} pageSize={PAGE_SIZE} totalResults={filteredStudents.length} selectedIds={selectedIds} hasFilters={Boolean(search || selectedCourse !== 'All courses' || studentDirectoryFilter !== 'all')} search={search} selectedCourse={selectedCourse} classFilter={studentDirectoryFilter} courses={courseOptions} sort={sort} onSearch={(value) => { setSearch(value); setPage(1) }} onCourse={(value) => { setSelectedCourse(value); setPage(1) }} onClassFilter={(value) => { setStudentDirectoryFilter(value); setPage(1) }} onSort={(value) => { setSort(value); setPage(1) }} onPage={setPage} onToggleStudent={(id) => setSelectedIds((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })} onTogglePage={(records) => setSelectedIds((current) => { const next = new Set(current); records.forEach((student) => next.has(student._id) ? next.delete(student._id) : next.add(student._id)); return next })} onView={setStudentToView} onEdit={(student) => { setEditingStudent(student); setFormOpen(true) }} onDelete={(records) => setStudentToDelete(records)} onResetFilters={() => { setSearch(''); setSelectedCourse('All courses'); setStudentDirectoryFilter('all'); setSort('date-desc'); setPage(1) }} onExport={exportCsv} onAdd={() => { setEditingStudent(null); setFormOpen(true) }} onDeleteSelected={() => setStudentToDelete(students.filter((student) => selectedIds.has(student._id)))} selectedCount={selectedIds.size} />
          </div>
        </section>
      )
    }
  }

  if (!authReady) return <main className="grid min-h-screen place-items-center bg-slate-50 text-xs text-slate-500">Checking campus account…</main>
  if (!user) return <LoginScreen onLogin={handleLogin} />

  return (
    <PermissionProvider permissions={user.permissions}>
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header key={`${user._id}:${user.role}:${user.department || ''}:${user.student?._id || user.student || ''}:${user.instructor?._id || user.instructor || ''}`} activeView={currentView} onChange={setActiveView} health={health} views={availableViews} permissions={user.permissions} user={user} developmentOptions={user.devUser ? developmentOptions || { departments: [], students: [], instructors: [] } : { departments: [], students: [], instructors: [] }} onLogout={handleLogout} onRefresh={loadAll} onRoleChange={handleRoleChange} onAction={handleHeaderAction} />
      {health.status === 'degraded' && <div className="mx-auto mt-4 flex max-w-[1440px] items-center gap-2 px-4 text-xs text-rose-700 sm:px-8"><AlertCircle size={15} />Campusdesk API is unavailable. Start MongoDB and the backend before using ERP modules.</div>}
      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-7 sm:px-8 sm:pt-9">{renderView()}</main>
      <Toast />
      {formOpen && <StudentModal student={editingStudent} saving={false} onClose={() => { setFormOpen(false); setEditingStudent(null) }} onSubmit={saveStudent} />}
      {studentToDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"><h2 className="text-sm font-semibold text-slate-900">Delete student records?</h2><p className="mt-2 text-xs leading-5 text-slate-500">Delete {studentToDelete.length} record{studentToDelete.length === 1 ? '' : 's'} from the campus directory?</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setStudentToDelete(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button><button onClick={confirmDelete} className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-semibold text-white">Delete</button></div></div></div>}
      {entityForm && <EntityFormModal key={`${entityForm}-${editingEntity?._id || 'new'}`} entityType={entityForm} instructors={instructors} initialValue={editingEntity} onClose={() => { setEntityForm(null); setEditingEntity(null) }} onSubmit={createEntity} />}
      {entryForm && <EntryModal key={`${entryForm}-${editingEntry?._id || 'new'}`} entryType={entryForm} students={students} courses={courses} initialValue={editingEntry} onClose={() => { setEntryForm(null); setEditingEntry(null) }} onSubmit={entryForm === 'attendance' ? (payload) => handleLogAttendance(payload, editingEntry) : (payload) => handleRecordGrade(payload, editingEntry)} />}
      <ConfirmDeleteModal item={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={removeRecord} />
      {importOpen && <CSVImportModal onClose={() => setImportOpen(false)} onImported={importStudents} />}
      {studentToView && <StudentDetailsModal student={studentToView} onClose={() => setStudentToView(null)} onEdit={(student) => { setStudentToView(null); setEditingStudent(student); setFormOpen(true) }} />}
    </div>
    </PermissionProvider>
  )
}

export default App
