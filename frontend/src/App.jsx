import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AttendanceTracker from './components/AttendanceTracker'
import ClubDirectory from './components/ClubDirectory'
import CoursesView from './components/CoursesView'
import CSVImportModal from './components/CSVImportModal'
import DashboardKPIs from './components/DashboardKPIs'
import EntityFormModal from './components/EntityFormModal'
import GradesView from './components/GradesView'
import InstructorsView from './components/InstructorsView'
import InternshipBoard from './components/InternshipBoard'
import LibraryView from './components/LibraryView'
import Navigation from './components/Navigation'
import StudentDetailsModal from './components/StudentDetailsModal'
import StudentModal from './components/StudentModal'
import StudentTable from './components/StudentTable'
import Toast from './components/Toast'
import { showToastError, showToastSuccess } from './components/toastHelpers'
import {
  applyInternship,
  bulkDeleteStudents,
  bulkImportStudents,
  createBook,
  createClub,
  createCourse,
  createInstructor,
  createInternship,
  createStudent,
  deleteStudent,
  fetchBooks,
  fetchClubs,
  fetchCourses,
  fetchHealth,
  fetchInstructors,
  fetchInternships,
  fetchStudentAnalytics,
  fetchStudentAttendance,
  fetchStudentBorrows,
  fetchStudentGrades,
  fetchStudents,
  issueBook,
  joinClub,
  recordGrade,
  returnBook,
  updateStudent,
} from './services/api'

const PAGE_SIZE = 10

function App() {
  const [activeView, setActiveView] = useState('Students')
  const [health, setHealth] = useState({ status: 'checking', database: 'checking' })
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [internships, setInternships] = useState([])
  const [clubs, setClubs] = useState([])
  const [books, setBooks] = useState([])
  const [borrows, setBorrows] = useState([])
  const [attendance, setAttendance] = useState([])
  const [grades, setGrades] = useState([])
  const [analytics, setAnalytics] = useState({ courseDistribution: [], ageGroups: [], monthlyEnrollment: [] })
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('All courses')
  const [sort, setSort] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [entityForm, setEntityForm] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [studentToView, setStudentToView] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [studentResponse, healthResponse, coursesResponse, instructorsResponse, internshipResponse, clubResponse, bookResponse, analyticsResponse] = await Promise.all([
        fetchStudents(),
        fetchHealth(),
        fetchCourses(),
        fetchInstructors(),
        fetchInternships(),
        fetchClubs(),
        fetchBooks(),
        fetchStudentAnalytics(),
      ])
      setStudents(studentResponse.students || studentResponse)
      setHealth({ status: healthResponse.status, database: healthResponse.database })
      setCourses(coursesResponse)
      setInstructors(instructorsResponse)
      setInternships(internshipResponse)
      setClubs(clubResponse)
      setBooks(bookResponse)
      setAnalytics(analyticsResponse)
      const attendanceResponses = await Promise.all((studentResponse.students || studentResponse).slice(0, 20).map((student) => fetchStudentAttendance(student._id)))
      const gradeResponses = await Promise.all((studentResponse.students || studentResponse).slice(0, 20).map((student) => fetchStudentGrades(student._id)))
      const studentBorrowResponses = await Promise.all((studentResponse.students || studentResponse).slice(0, 20).map((student) => fetchStudentBorrows(student._id)))
      setAttendance(attendanceResponses.flatMap((response, index) => (response.records || []).map((record) => ({ ...record, student: (studentResponse.students || studentResponse)[index]._id, percentage: response.percentage }))))
      setGrades(gradeResponses.flatMap((response) => response.results || []))
      setBorrows(studentBorrowResponses.flat())
    } catch (error) {
      setHealth({ status: 'degraded', database: 'disconnected' })
      showToastError(error.response?.data?.message || 'Unable to reach the Campusdesk API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll()
    const interval = window.setInterval(() => fetchHealth().then((result) => setHealth({ status: result.status, database: result.database })).catch(() => setHealth({ status: 'degraded', database: 'disconnected' })), 30000)
    return () => window.clearInterval(interval)
  }, [])

  const courseOptions = useMemo(() => ['All courses', ...new Set(students.map((student) => student.course).filter(Boolean))], [students])
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = students.filter((student) => {
      const matchesSearch = !query || [student.name, student.email, student.course].some((value) => value?.toLowerCase().includes(query))
      const matchesCourse = selectedCourse === 'All courses' || student.course === selectedCourse
      return matchesSearch && matchesCourse
    })
    return [...items].sort((left, right) => {
      if (sort === 'age-asc') return Number(left.age) - Number(right.age)
      if (sort === 'age-desc') return Number(right.age) - Number(left.age)
      if (sort === 'name-asc') return left.name.localeCompare(right.name)
      if (sort === 'name-desc') return right.name.localeCompare(left.name)
      return new Date(right.createdAt) - new Date(left.createdAt)
    })
  }, [search, selectedCourse, sort, students])
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
    const fields = ['name', 'email', 'course', 'age']
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
    const services = {
      course: createCourse,
      instructor: createInstructor,
      internship: createInternship,
      club: createClub,
      book: createBook,
    }
    const service = services[entityForm]
    if (!service) throw new Error('Select a valid entity type.')
    await service(payload)
    showToastSuccess('Record created successfully')
    await loadAll()
  }

  const loadAttendance = async () => {
    if (!students.length) return
    const records = await Promise.all(students.slice(0, 10).map((student) => fetchStudentAttendance(student._id)))
    setAttendance(records.map((record, index) => ({ ...record, student: students[index]._id, date: new Date().toISOString(), status: record.percentage < 75 ? 'Absent' : 'Present' })))
  }

  const loadGrades = async () => {
    if (!students.length) return
    const results = await Promise.all(students.map((student) => fetchStudentGrades(student._id)))
    setGrades(results.flatMap((response) => response.results || []))
  }

  const handleRecordGrade = async (payload) => {
    try {
      await recordGrade(payload)
      showToastSuccess('Grade updated')
      await loadGrades()
    } catch (error) {
      showToastError(error.response?.data?.message || 'Unable to record grade')
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

  const renderView = () => {
    switch (activeView) {
      case 'Analytics': return <AnalyticsDashboard data={analytics} />
      case 'Courses': return <CoursesView courses={courses} instructors={instructors} onCreate={() => setEntityForm('course')} />
      case 'Instructors': return <InstructorsView instructors={instructors} onCreate={() => setEntityForm('instructor')} />
      case 'Internships': return <InternshipBoard internships={internships} studentId={students[0]?._id} onApply={handleApply} onCreate={() => setEntityForm('internship')} />
      case 'Attendance': return <AttendanceTracker attendance={attendance} students={students} courses={courses} onLog={loadAttendance} />
      case 'Clubs': return <ClubDirectory clubs={clubs} instructors={instructors} onJoin={handleJoin} onCreate={() => setEntityForm('club')} />
      case 'Library': return <LibraryView books={books} borrows={borrows} studentId={students[0]?._id} onIssue={handleIssueBook} onReturn={handleReturnBook} onCreate={() => setEntityForm('book')} />
      case 'Grades': return <GradesView grades={grades} students={students} courses={courses} onRecord={handleRecordGrade} />
      default: return (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-800">Academic registration</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Student management</h1><p className="mt-1 text-xs text-slate-500">Manage enrollment records, course assignments, and student details.</p></div><button onClick={() => setImportOpen(true)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">Import CSV</button></div>
          <DashboardKPIs students={students} apiStatus={health.status === 'ok' ? 'connected' : 'error'} databaseStatus={health.database} />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <StudentTable students={pageStudents} loading={loading} page={page} pageSize={PAGE_SIZE} totalResults={filteredStudents.length} selectedIds={selectedIds} hasFilters={Boolean(search || selectedCourse !== 'All courses')} search={search} selectedCourse={selectedCourse} courses={courseOptions} sort={sort} onSearch={(value) => { setSearch(value); setPage(1) }} onCourse={(value) => { setSelectedCourse(value); setPage(1) }} onSort={(value) => { setSort(value); setPage(1) }} onPage={setPage} onToggleStudent={(id) => setSelectedIds((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })} onTogglePage={(records) => setSelectedIds((current) => { const next = new Set(current); records.forEach((student) => next.has(student._id) ? next.delete(student._id) : next.add(student._id)); return next })} onView={setStudentToView} onEdit={(student) => { setEditingStudent(student); setFormOpen(true) }} onDelete={(records) => setStudentToDelete(records)} onResetFilters={() => { setSearch(''); setSelectedCourse('All courses'); setSort('date-desc'); setPage(1) }} onExport={exportCsv} onAdd={() => { setEditingStudent(null); setFormOpen(true) }} onDeleteSelected={() => setStudentToDelete(students.filter((student) => selectedIds.has(student._id)))} selectedCount={selectedIds.size} />
          </div>
        </section>
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation activeView={activeView} onChange={setActiveView} health={health} />
      {health.status === 'degraded' && <div className="mx-auto mt-4 flex max-w-[1440px] items-center gap-2 px-4 text-xs text-rose-700 sm:px-8"><AlertCircle size={15} />Campusdesk API is unavailable. Start MongoDB and the backend before using ERP modules.</div>}
      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-7 sm:px-8 sm:pt-9">{renderView()}</main>
      <Toast />
      {formOpen && <StudentModal student={editingStudent} saving={false} onClose={() => { setFormOpen(false); setEditingStudent(null) }} onSubmit={saveStudent} />}
      {studentToDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"><h2 className="text-sm font-semibold text-slate-900">Delete student records?</h2><p className="mt-2 text-xs leading-5 text-slate-500">Delete {studentToDelete.length} record{studentToDelete.length === 1 ? '' : 's'} from the campus directory?</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setStudentToDelete(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button><button onClick={confirmDelete} className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-semibold text-white">Delete</button></div></div></div>}
      {entityForm && <EntityFormModal entityType={entityForm} instructors={instructors} onClose={() => setEntityForm(null)} onSubmit={createEntity} />}
      {importOpen && <CSVImportModal onClose={() => setImportOpen(false)} onImported={importStudents} />}
      {studentToView && <StudentDetailsModal student={studentToView} onClose={() => setStudentToView(null)} onEdit={(student) => { setStudentToView(null); setEditingStudent(student); setFormOpen(true) }} />}
    </div>
  )
}

export default App
