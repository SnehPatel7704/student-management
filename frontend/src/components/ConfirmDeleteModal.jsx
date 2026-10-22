import { AlertTriangle, Trash2, X } from 'lucide-react'

export default function ConfirmDeleteModal({ item, onCancel, onConfirm }) {
  if (!item) return null
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <section aria-labelledby="confirm-delete-title" aria-modal="true" className="w-full max-w-[410px] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" role="alertdialog">
      <div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-lg bg-rose-50 text-rose-700"><AlertTriangle size={19} /></span><button aria-label="Close confirmation" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" onClick={onCancel} type="button"><X size={17} /></button></div>
      <h2 className="mt-5 text-lg font-bold text-slate-900" id="confirm-delete-title">Delete {item.type}?</h2>
      <p className="mt-2 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-700">{item.label}</span> will be permanently removed.</p>
      <div className="mt-6 flex gap-2"><button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-xs font-semibold text-white hover:bg-rose-800" onClick={onConfirm} type="button"><Trash2 size={14} />Delete</button><button className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={onCancel} type="button">Cancel</button></div>
    </section>
  </div>
}