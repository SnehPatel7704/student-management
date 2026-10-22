import { CalendarDays, Mail, UserRound, X } from 'lucide-react'
import usePermissions from '../hooks/usePermissions'

export default function StudentDetailsModal({ student, onClose, onEdit }) {
  const permissions = usePermissions()
  const canEdit = permissions.includes('*') || permissions.includes('students.manage')
  if (!student) return null
  const dateAdded = student.createdAt ? new Date(student.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not available'

  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section aria-labelledby="details-title" aria-modal="true" className="h-full w-full max-w-[420px] bg-white p-6 shadow-2xl sm:p-8" role="dialog" style={{ animation: 'drawer-in 240ms ease-out both' }}>
      <div className="flex items-center justify-between"><p className="text-[9px] font-semibold tracking-[0.12em] text-cyan-800">STUDENT PROFILE</p><button aria-label="Close student details" className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" onClick={onClose} type="button"><X size={18} /></button></div>
      <div className="mt-10 grid size-16 place-items-center rounded-2xl bg-cyan-50 font-['Manrope'] text-xl font-bold text-cyan-900">{student.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')}</div>
      <h2 className="mt-5 font-['Manrope'] text-2xl font-bold text-slate-900" id="details-title">{student.name}</h2>
      <span className="mt-2 inline-flex rounded-full bg-violet-50 px-3 py-1 text-[10px] font-medium text-violet-800">{student.program || student.course}</span>
      <dl className="mt-9 divide-y divide-slate-100 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 px-4 py-4"><CalendarDays className="text-slate-400" size={16} /><div><dt className="text-[9px] font-semibold tracking-wide text-slate-400">CLASS</dt><dd className="mt-1 text-xs text-slate-700">{[student.academicYear, student.semester, student.division && `Division ${student.division}`].filter(Boolean).join(' · ') || 'Unassigned'}</dd></div></div>
        <div className="flex items-center gap-3 px-4 py-4"><UserRound className="text-slate-400" size={16} /><div><dt className="text-[9px] font-semibold tracking-wide text-slate-400">DEPARTMENT</dt><dd className="mt-1 text-xs text-slate-700">{student.department || student.course || 'Unassigned'}</dd></div></div>
        <div className="flex items-center gap-3 px-4 py-4"><Mail className="text-slate-400" size={16} /><div><dt className="text-[9px] font-semibold tracking-wide text-slate-400">EMAIL ADDRESS</dt><dd className="mt-1 break-all text-xs text-slate-700">{student.email}</dd></div></div>
        <div className="flex items-center gap-3 px-4 py-4"><UserRound className="text-slate-400" size={16} /><div><dt className="text-[9px] font-semibold tracking-wide text-slate-400">AGE</dt><dd className="mt-1 text-xs text-slate-700">{student.age} years</dd></div></div>
        <div className="flex items-center gap-3 px-4 py-4"><CalendarDays className="text-slate-400" size={16} /><div><dt className="text-[9px] font-semibold tracking-wide text-slate-400">DATE ADDED</dt><dd className="mt-1 text-xs text-slate-700">{dateAdded}</dd></div></div>
      </dl>
      {canEdit && <button className="mt-6 h-10 w-full rounded-lg bg-cyan-900 text-xs font-semibold text-white transition hover:bg-cyan-800" onClick={() => onEdit(student)} type="button">Edit student record</button>}
    </section>
  </div>
}