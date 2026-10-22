import { useMemo, useState } from 'react'
import { CalendarDays, ClipboardCheck, Plus } from 'lucide-react'

function classLabel(lecture) {
  return [
    lecture.program,
    lecture.academicYear,
    lecture.semester,
    `Division ${lecture.division}`,
    lecture.department,
  ].filter(Boolean).join(' · ')
}

export function LectureSchedule({ lectures, canManage, onCreate, onEdit, onDelete }) {
  const groupedLectures = useMemo(() => lectures.reduce((groups, lecture) => {
    const department = lecture.department || 'Unassigned department'
    groups[department] = [...(groups[department] || []), lecture]
    return groups
  }, {}), [lectures])

  return (
    <section className="space-y-4" id="class-timetable">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Faculty timetable</h2>
          <p className="mt-1 text-xs text-slate-500">Lectures are grouped by department and linked to a course, instructor, and class division.</p>
        </div>
        {canManage && <button className="inline-flex items-center gap-2 rounded-lg bg-cyan-900 px-3 py-2 text-xs font-semibold text-white" onClick={onCreate} type="button"><Plus size={14} />Schedule lecture</button>}
      </div>
      {Object.entries(groupedLectures).map(([department, departmentLectures]) => (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white" key={department}>
          <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-cyan-900">{department}</h3>
          <div className="divide-y divide-slate-100">
            {departmentLectures.map((lecture) => (
              <article className="flex flex-wrap items-start justify-between gap-3 px-4 py-3" key={lecture._id}>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{lecture.instructor?.name || 'Faculty not assigned'} · {lecture.instructor?.designation || 'Role unassigned'}</p>
                  <p className="mt-1 text-[11px] text-slate-600">{lecture.course?.code} · {lecture.course?.title}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{classLabel(lecture)}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-cyan-800"><CalendarDays size={12} />{lecture.dayOfWeek} · {lecture.startTime}–{lecture.endTime} · {lecture.room}</p>
                </div>
                {canManage && <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50" onClick={() => onEdit(lecture)} type="button">Edit</button>
                  <button className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-[10px] font-medium text-rose-700 hover:bg-rose-50" onClick={() => onDelete(lecture)} type="button">Delete</button>
                </div>}
              </article>
            ))}
          </div>
        </section>
      ))}
      {!lectures.length && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">No lectures are scheduled yet.</p>}
    </section>
  )
}

export function LectureAttendance({ lectures, canManage, onLoadAttendance, onSaveAttendance }) {
  const [lectureId, setLectureId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [session, setSession] = useState(null)
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openRoster = async () => {
    if (!lectureId) return
    setLoading(true)
    setError('')
    try {
      const result = await onLoadAttendance(lectureId, date)
      setSession(result)
      setStatuses(Object.fromEntries(result.students.map((student) => [
        student._id,
        result.records.find((record) => (record.student?._id || record.student) === student._id)?.status || 'Present',
      ])))
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load this lecture roster.')
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const saveRoster = async () => {
    if (!session || !canManage) return
    setSaving(true)
    setError('')
    try {
      await onSaveAttendance(lectureId, {
        date,
        records: session.students.map((student) => ({ student: student._id, status: statuses[student._id] })),
      })
      await openRoster()
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to save lecture attendance.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4" id="lecture-attendance">
      <div>
        <h2 className="text-base font-bold text-slate-900">Lecture attendance</h2>
        <p className="mt-1 text-xs text-slate-500">Choose a scheduled lecture to load only the students assigned to that class.</p>
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
        <label className="text-xs font-semibold text-slate-700">Lecture
          <select className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs" onChange={(event) => { setLectureId(event.target.value); setSession(null) }} value={lectureId}>
            <option value="">Select a lecture</option>
            {lectures.map((lecture) => <option key={lecture._id} value={lecture._id}>{lecture.course?.code} · {lecture.program} {lecture.academicYear} {lecture.division} · {lecture.dayOfWeek} {lecture.startTime}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">Class date
          <input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs" onChange={(event) => { setDate(event.target.value); setSession(null) }} type="date" value={date} />
        </label>
        <button className="h-10 rounded-lg bg-cyan-900 px-4 text-xs font-semibold text-white disabled:opacity-50" disabled={!lectureId || loading} onClick={openRoster} type="button">{loading ? 'Loading…' : 'Load class roster'}</button>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      {session && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">{session.lecture.course?.code} · {session.lecture.course?.title}</h3>
              <p className="mt-1 text-[10px] text-slate-500">{classLabel(session.lecture)} · {session.students.length} students</p>
            </div>
            {canManage && <button className="inline-flex items-center gap-2 rounded-lg bg-cyan-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" disabled={saving || session.students.length === 0} onClick={saveRoster} type="button"><ClipboardCheck size={14} />{saving ? 'Saving…' : 'Save attendance'}</button>}
          </div>
          {session.students.length ? (
            <ul className="divide-y divide-slate-100">
              {session.students.map((student) => (
                <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={student._id}>
                  <div><p className="text-xs font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-[10px] text-slate-500">{student.email} · {student.program} {student.academicYear} {student.division}</p></div>
                  <select aria-label={`Attendance status for ${student.name}`} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs disabled:bg-slate-50" disabled={!canManage} onChange={(event) => setStatuses((current) => ({ ...current, [student._id]: event.target.value }))} value={statuses[student._id] || 'Present'}>
                    <option>Present</option><option>Absent</option><option>Excused</option>
                  </select>
                </li>
              ))}
            </ul>
          ) : <p className="p-6 text-center text-xs text-slate-500">No students match this lecture’s program, year, semester, division, and department. Assign class details to students first.</p>}
        </section>
      )}
    </section>
  )
}
