import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, UserRound, Eye, Pencil, Trash2 } from 'lucide-react'

const avatarTones = [
  'bg-cyan-50 text-cyan-800', 'bg-amber-50 text-amber-800', 'bg-violet-50 text-violet-800',
  'bg-emerald-50 text-emerald-800', 'bg-rose-50 text-rose-800', 'bg-blue-50 text-blue-800',
]
const courseTones = ['bg-cyan-50 text-cyan-800', 'bg-violet-50 text-violet-800', 'bg-amber-50 text-amber-800', 'bg-emerald-50 text-emerald-800', 'bg-rose-50 text-rose-800']

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?'
}

function SkeletonRows() {
  return Array.from({ length: 6 }, (_, index) => <tr className="animate-pulse border-b border-slate-100" key={index}>
    <td className="px-4 py-4 sm:px-5"><div className="flex items-center gap-3"><span className="size-9 rounded-full bg-slate-100" /><span className="space-y-2"><span className="block h-2.5 w-28 rounded bg-slate-100" /><span className="block h-2 w-36 rounded bg-slate-100" /></span></div></td>
    <td className="px-3 py-4"><span className="block h-5 w-16 rounded-full bg-slate-100" /></td>
    <td className="px-3 py-4"><span className="block h-2.5 w-6 rounded bg-slate-100" /></td>
    <td className="px-3 py-4"><span className="block h-2.5 w-20 rounded bg-slate-100" /></td>
    <td className="px-4 py-4"><span className="block h-7 w-7 rounded bg-slate-100" /></td>
  </tr>)
}

function EmptyState({ hasFilters, onReset }) {
  return <tr><td className="px-5 py-16 text-center" colSpan="6">
    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-800"><UserRound size={21} /></span>
    <strong className="mt-4 block text-sm font-semibold text-slate-800">{hasFilters ? 'No students match these filters' : 'Your student directory is ready'}</strong>
    <span className="mx-auto mt-1 block max-w-sm text-xs leading-5 text-slate-500">{hasFilters ? 'Try adjusting your search or course filter to find the record you need.' : 'Once student records are added, they will appear here for review and management.'}</span>
    {hasFilters && <button className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-cyan-900 transition hover:bg-slate-50" onClick={onReset} type="button">Reset filters</button>}
  </td></tr>
}

export default function StudentTable({
  students, loading, page, pageSize, totalResults, selectedIds,
  hasFilters, onPage, onToggleStudent, onTogglePage, onView, onEdit, onDelete, onResetFilters,
}) {
  const [openMenu, setOpenMenu] = useState(null)
  const pageCount = Math.max(1, Math.ceil(totalResults / pageSize))
  const firstResult = totalResults ? (page - 1) * pageSize + 1 : 0
  const lastResult = Math.min(page * pageSize, totalResults)
  const allPageSelected = students.length > 0 && students.every((student) => selectedIds.has(student._id))
  return <>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[740px] border-collapse text-left">
        <thead className="bg-slate-50/80">
          <tr className="border-y border-slate-100 text-[9px] font-semibold tracking-[0.1em] text-slate-500">
            <th className="w-10 px-4 py-3 sm:px-5"><input aria-label="Select all students on this page" checked={allPageSelected} className="size-3.5 accent-cyan-800" onChange={() => onTogglePage(students)} type="checkbox" /></th>
            <th className="px-2 py-3">STUDENT</th><th className="px-3 py-3">COURSE</th><th className="px-3 py-3">AGE</th><th className="px-3 py-3">DATE ADDED</th><th aria-label="Actions" className="w-16 px-4 py-3" scope="col" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? <SkeletonRows /> : students.length === 0 ? <EmptyState hasFilters={hasFilters} onReset={onResetFilters} /> : students.map((student, index) => <tr className="group transition-colors hover:bg-slate-50/70" key={student._id}>
            <td className="px-4 py-3.5 sm:px-5"><input aria-label={`Select ${student.name}`} checked={selectedIds.has(student._id)} className="size-3.5 accent-cyan-800" onChange={() => onToggleStudent(student._id)} type="checkbox" /></td>
            <td className="px-2 py-3.5"><div className="flex min-w-0 items-center gap-3">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full font-['Manrope'] text-[10px] font-bold ${avatarTones[index % avatarTones.length]}`}>{initials(student.name)}</span>
              <span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-800">{student.name}</span><span className="mt-1 block truncate text-[10px] text-slate-500">{student.email}</span></span>
            </div></td>
            <td className="px-3 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${courseTones[student.course.toLowerCase().split('').reduce((total, char) => total + char.charCodeAt(0), 0) % courseTones.length]}`}>{student.course}</span></td>
            <td className="px-3 py-3.5 text-xs tabular-nums text-slate-600">{student.age}</td>
            <td className="px-3 py-3.5 text-[10px] text-slate-500">{student.createdAt ? new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
            <td className="relative px-4 py-3.5 text-right">
              <button aria-expanded={openMenu === student._id} aria-label={`Actions for ${student.name}`} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpenMenu(openMenu === student._id ? null : student._id)} type="button"><MoreHorizontal size={17} /></button>
              {openMenu === student._id && <>
                <button aria-label="Close row actions" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenMenu(null)} type="button" />
                <div className="absolute right-6 top-11 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-slate-600 hover:bg-slate-50" onClick={() => { setOpenMenu(null); onView(student) }} type="button"><Eye size={14} />View details</button>
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-slate-600 hover:bg-slate-50" onClick={() => { setOpenMenu(null); onEdit(student) }} type="button"><Pencil size={14} />Edit student</button>
                  <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] text-rose-700 hover:bg-rose-50" onClick={() => { setOpenMenu(null); onDelete([student]) }} type="button"><Trash2 size={14} />Delete student</button>
                </div>
              </>}
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p aria-live="polite" className="text-[10px] text-slate-500">Showing <span className="font-semibold text-slate-700">{firstResult}–{lastResult}</span> of <span className="font-semibold text-slate-700">{totalResults}</span> students</p>
      <div className="flex items-center gap-1.5">
        <button aria-label="Previous page" className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)} type="button"><ChevronLeft size={15} /></button>
        <span className="px-2 text-[10px] tabular-nums text-slate-500">Page <strong className="text-slate-800">{page}</strong> of {pageCount}</span>
        <button aria-label="Next page" className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" disabled={page >= pageCount || loading} onClick={() => onPage(page + 1)} type="button"><ChevronRight size={15} /></button>
        <ChevronDown aria-hidden="true" className="ml-1 hidden text-slate-300 sm:block" size={13} />
      </div>
    </footer>
  </>
}