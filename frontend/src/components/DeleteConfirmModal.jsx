import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react'

export default function DeleteConfirmModal({ students, deleting, onCancel, onConfirm }) {
  if (!students?.length) return null
  const isBatch = students.length > 1

  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel() }}>
    <section aria-labelledby="delete-title" aria-modal="true" className="w-full max-w-[410px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" role="alertdialog" style={{ animation: 'modal-in 180ms ease-out both' }}>
      <div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><AlertTriangle size={19} /></span><button aria-label="Close confirmation" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" disabled={deleting} onClick={onCancel} type="button"><X size={17} /></button></div>
      <h2 className="mt-5 font-['Manrope'] text-lg font-bold text-slate-900" id="delete-title">{isBatch ? `Delete ${students.length} students?` : 'Delete student?'}</h2>
      <p className="mt-2 text-xs leading-5 text-slate-500">{isBatch ? 'These records will be permanently removed from the student directory.' : <><span className="font-semibold text-slate-700">{students[0].name}</span> will be permanently removed from the student directory.</>}</p>
      <div className="mt-6 flex gap-2"><button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60" disabled={deleting} onClick={onConfirm} type="button">{deleting ? <><LoaderCircle className="animate-spin" size={15} />Deleting…</> : <><Trash2 size={14} />Delete {isBatch ? 'records' : 'student'}</>}</button><button className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50" disabled={deleting} onClick={onCancel} type="button">Cancel</button></div>
    </section>
  </div>
}