import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowDownUp, RefreshCw, UsersRound } from 'lucide-react'
import Header from './components/Header'
import StatCards from './components/StatCards'
import FilterToolbar from './components/FilterToolbar'
import StudentTable from './components/StudentTable'
import StudentModal from './components/StudentModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import StudentDetailsModal from './components/StudentDetailsModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const PAGE_SIZE = 10

function sortRecords(records, sort) {
  return [...records].sort((left, right) => {
    if (sort === 'name-asc') return left.name.localeCompare(right.name)
    if (sort === 'name-desc') return right.name.localeCompare(left.name)
    if (sort === 'age-asc') return Number(left.age) - Number(right.age)
    if (sort === 'age-desc') return Number(right.age) - Number(left.age)
    return new Date(right.createdAt || 0) - new Date(left.createdAt || 0)
  })
}

function exportCsv(students) {
  const fields = ['name', 'email', 'course', 'age']
  const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const content = [fields.join(','), ...students.map((student) => fields.map((field) => escapeCell(student[field])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'student-directory.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')
  const [databaseStatus, setDatabaseStatus] = useState('checking')
  const [apiError, setApiError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('All courses')
  const [sort, setSort] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [viewingStudent, setViewingStudent] = useState(null)

  useEffect(() => {
    let active = true
    async function fetchInitialData() {
      const [studentResult, healthResult] = await Promise.allSettled([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/health`),
      ])
      if (!active) return
      if (studentResult.status === 'fulfilled') {
        setStudents(studentResult.value.data)
        setApiError('')
      } else {
        setApiError('Could not reach the student API. Check the backend and MongoDB connection.')
      }
      if (healthResult.status === 'fulfilled') {
        setApiStatus('connected')
        setDatabaseStatus(healthResult.value.data.database || 'connected')
      } else {
        setApiStatus('error')
        setDatabaseStatus('unavailable')
      }
      setLoading(false)
    }
    fetchInitialData()
    const healthInterval = window.setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/health`)
        if (!active) return
        setApiStatus('connected')
        setDatabaseStatus(response.data.database || 'connected')
      } catch {
        if (!active) return
        setApiStatus('error')
        setDatabaseStatus('unavailable')
      }
    }, 30000)
    return () => {
      active = false
      window.clearInterval(healthInterval)
    }
  }, [])

  async function refreshStudents() {
    setLoading(true)
    try {
      const [studentResponse, healthResponse] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/health`),
      ])
      setStudents(studentResponse.data)
      setApiStatus('connected')
      setDatabaseStatus(healthResponse.data.database || 'connected')
      setApiError('')
    } catch {
      setApiStatus('error')
      setDatabaseStatus('unavailable')
      setApiError('Could not refresh data. The API or database is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  const courses = useMemo(() => [...new Set(students.map((student) => student.course.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [students])
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = students.filter((student) => {
      const matchesCourse = selectedCourse === 'All courses' || student.course.toLowerCase() === selectedCourse.toLowerCase()
      const matchesSearch = !query || [student.name, student.email, student.course].some((value) => value.toLowerCase().includes(query))
      return matchesCourse && matchesSearch
    })
    return sortRecords(matching, sort)
  }, [students, search, selectedCourse, sort])
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const pageStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setSelectedCourse('All courses')
    setSort('date-desc')
    setPage(1)
  }

  function openCreate() {
    setEditingStudent(null)
    setFormOpen(true)
  }

  function openEdit(student) {
    setViewingStudent(null)
    setEditingStudent(student)
    setFormOpen(true)
  }

  async function saveStudent(payload) {
    setSaving(true)
    try {
      if (editingStudent) {
        const response = await axios.put(`${API_URL}/students/${editingStudent._id}`, payload)
        setStudents((current) => current.map((student) => student._id === editingStudent._id ? response.data : student))
        toast.success('Student record updated')
      } else {
        const response = await axios.post(`${API_URL}/students`, payload)
        setStudents((current) => [response.data, ...current])
        toast.success('Student added to the directory')
      }
      setSelectedIds(new Set())
      setPage(1)
      return true
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Could not save this student')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!studentToDelete?.length) return
    const ids = studentToDelete.map((student) => student._id)
    setDeleting(true)
    try {
      await Promise.all(ids.map((id) => axios.delete(`${API_URL}/students/${id}`)))
      setStudents((current) => current.filter((student) => !ids.includes(student._id)))
      setSelectedIds((current) => new Set([...current].filter((id) => !ids.includes(id))))
      setStudentToDelete(null)
      setPage(1)
      toast.success(ids.length > 1 ? `${ids.length} student records deleted` : 'Student record deleted')
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Could not delete all selected records')
      refreshStudents()
    } finally {
      setDeleting(false)
    }
  }

  function toggleStudent(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function togglePage(studentsOnPage) {
    setSelectedIds((current) => {
      const next = new Set(current)
      const selectAll = !studentsOnPage.every((student) => next.has(student._id))
      studentsOnPage.forEach((student) => selectAll ? next.add(student._id) : next.delete(student._id))
      return next
    })
  }

  const selectedStudents = students.filter((student) => selectedIds.has(student._id))

  return <div className="min-h-screen bg-[var(--canvas)] text-slate-900" id="top">
    <Header apiStatus={apiStatus} onRefresh={refreshStudents} />
    <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-7 sm:px-8 sm:pt-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[9px] font-semibold tracking-[0.13em] text-cyan-800">CAMPUS ADMINISTRATION <span className="px-1.5 text-slate-300">/</span> PEOPLE</p>
          <h1 className="font-['Manrope'] text-[26px] font-bold leading-tight tracking-normal text-slate-900 sm:text-[30px]">Student management</h1>
          <p className="mt-2 text-xs text-slate-500">Manage enrollment records, course assignments, and student details.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-500 md:flex"><span className="size-1.5 rounded-full bg-emerald-500" />Academic year 2026–27</span>
          <button aria-label="Refresh student data" className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" onClick={refreshStudents} type="button"><RefreshCw className={loading ? 'animate-spin' : ''} size={15} /></button>
        </div>
      </div>

      <StatCards apiStatus={apiStatus} databaseStatus={databaseStatus} students={students} />

      {apiError && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800" role="alert"><span>{apiError}</span><button className="font-semibold underline underline-offset-2" onClick={refreshStudents} type="button">Retry connection</button></div>}

      <section aria-labelledby="students-heading" className="mt-6 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_5px_22px_rgba(22,43,55,0.035)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-5 sm:px-5">
          <div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-lg bg-cyan-50 text-cyan-900"><UsersRound size={16} /></span><div><h2 className="text-sm font-semibold text-slate-900" id="students-heading">Student directory</h2><p className="mt-0.5 text-[10px] text-slate-500">Browse and manage student records</p></div></div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium tabular-nums text-slate-600">{filteredStudents.length} {filteredStudents.length === 1 ? 'record' : 'records'}</span>
        </div>
        <FilterToolbar
          courses={courses}
          onAdd={openCreate}
          onCourse={(value) => { setSelectedCourse(value); setPage(1) }}
          onDeleteSelected={() => setStudentToDelete(selectedStudents)}
          onExport={() => { exportCsv(filteredStudents); toast.success('CSV export downloaded') }}
          onSearch={(value) => { setSearch(value); setPage(1) }}
          onSort={(value) => { setSort(value); setPage(1) }}
          search={search}
          selectedCourse={selectedCourse}
          selectedCount={selectedIds.size}
          sort={sort}
        />
        <StudentTable
          loading={loading}
          onDelete={setStudentToDelete}
          onEdit={openEdit}
          hasFilters={Boolean(search.trim() || selectedCourse !== 'All courses')}
          onPage={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), pageCount))}
          onResetFilters={resetFilters}
          onTogglePage={togglePage}
          onToggleStudent={toggleStudent}
          onView={setViewingStudent}
          page={page}
          pageSize={PAGE_SIZE}
          selectedIds={selectedIds}
          students={pageStudents}
          totalResults={filteredStudents.length}
        />
      </section>

      <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400"><span className="inline-flex items-center gap-1.5"><ArrowDownUp size={11} /> Data synced with student records API</span><span>Campusdesk Admin Portal</span></div>
    </main>
    <Toaster position="bottom-right" toastOptions={{ duration: 2800, style: { border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' } }} />
    {formOpen && <StudentModal key={editingStudent?._id || 'new'} onClose={() => setFormOpen(false)} onSubmit={saveStudent} saving={saving} student={editingStudent} />}
    {studentToDelete && <DeleteConfirmModal deleting={deleting} onCancel={() => setStudentToDelete(null)} onConfirm={confirmDelete} students={studentToDelete} />}
    {viewingStudent && <StudentDetailsModal onClose={() => setViewingStudent(null)} onEdit={openEdit} student={viewingStudent} />}
  </div>
}

export default App