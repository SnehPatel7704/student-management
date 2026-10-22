import { BookOpen, CalendarCheck2, GraduationCap, LibraryBig } from 'lucide-react'

export default function PortalView({ data, user }) {
  const { student, attendance, grades, borrows } = data || {}
  const present = attendance?.filter((record) => record.status === 'Present').length || 0
  const attendanceRate = attendance?.length ? Math.round((present / attendance.length) * 100) : 0
  const classDetails = [
    student?.program || student?.course,
    student?.department,
    student?.academicYear,
    student?.semester && `Semester ${student.semester}`,
    student?.division && `Division ${student.division}`,
  ].filter(Boolean).join(' · ')
  return <section className="space-y-6">
    <div id="portal-profile"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-800">{user.role.replaceAll('_', ' ')}</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{student?.name || 'My campus portal'}</h1><p className="mt-1 text-xs text-slate-500">{classDetails || 'Your linked campus records'}</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" id="portal-overview">
      <Metric id="portal-attendance" icon={CalendarCheck2} label="Attendance" value={`${attendanceRate}%`} />
      <Metric id="portal-grades" icon={GraduationCap} label="Grade records" value={grades?.length || 0} />
      <Metric id="portal-courses" icon={BookOpen} label="Courses" value={new Set([...(attendance || []).map((record) => record.course?.code), ...(grades || []).map((record) => record.course?.code)].filter(Boolean)).size} />
      <Metric id="portal-library" icon={LibraryBig} label="Library checkouts" value={borrows?.filter((record) => record.status === 'Issued').length || 0} />
    </div>
    <section id="portal-grades-table" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Academic results</h2></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="bg-slate-50 text-[9px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Assessment</th><th className="px-4 py-3">Marks</th><th className="px-4 py-3">Grade</th></tr></thead><tbody>{grades?.map((record) => <tr className="border-t border-slate-100 text-xs" key={record._id}><td className="px-4 py-3">{record.course?.code || 'Course'}</td><td className="px-4 py-3">{record.examType}</td><td className="px-4 py-3">{record.marksObtained}/{record.maxMarks}</td><td className="px-4 py-3 font-semibold">{record.grade}</td></tr>)}</tbody></table></div>
      {!grades?.length && <p className="p-5 text-xs text-slate-500">No academic results yet.</p>}
    </section>
    <section id="portal-attendance-table" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Attendance history</h2></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="bg-slate-50 text-[9px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Course / Lecture</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{attendance?.slice(0, 20).map((record) => <tr className="border-t border-slate-100 text-xs" key={record._id}><td className="px-4 py-3">{new Date(record.date).toLocaleDateString()}</td><td className="px-4 py-3">{record.course?.code || 'Course'}{record.lecture?.startTime ? ` · ${record.lecture.startTime}` : ''}</td><td className="px-4 py-3">{record.status}</td></tr>)}</tbody></table></div>
      {!attendance?.length && <p className="p-5 text-xs text-slate-500">No attendance records yet.</p>}
    </section>
  </section>
}

function Metric({ id, icon: Icon, label, value }) {
  return <article id={id} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><Icon className="text-cyan-800" size={17} /></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></article>
}
