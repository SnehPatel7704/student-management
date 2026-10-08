import { useState } from 'react'
import { FileSpreadsheet, Upload, X } from 'lucide-react'

export default function CSVImportModal({ onClose, onImported }) {
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)

  const parseCsv = async (file) => {
    if (!file) return
    setFileName(file.name)
    const text = await file.text()
    const parsed = text.trim().split(/\r?\n/).map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')))
    setRows(parsed.slice(1).map((row) => ({ name: row[0], email: row[1], course: row[2], age: row[3] })))
  }

  const importData = async () => {
    setImporting(true)
    try {
      await onImported(rows)
      onClose()
    } finally {
      setImporting(false)
    }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><div className="w-full max-w-xl rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-900">Import student CSV</h2><p className="mt-1 text-[10px] text-slate-500">Columns: name, email, course, age</p></div><button onClick={onClose} aria-label="Close import modal" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X size={16} /></button></div><div className="p-5"><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-cyan-200 bg-cyan-50/40 p-5 text-center transition hover:border-cyan-500"><FileSpreadsheet className="text-cyan-700" size={26} /><span className="mt-3 text-xs font-semibold text-slate-800">Drop a CSV file here or browse</span><span className="mt-1 text-[10px] text-slate-500">{fileName || 'Maximum 1 MB'}</span><input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => parseCsv(event.target.files[0])} /></label>{rows.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-full text-left text-[10px]"><thead className="bg-slate-50"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Age</th></tr></thead><tbody>{rows.slice(0, 5).map((row, index) => <tr key={`${row.email}-${index}`} className="border-t border-slate-100"><td className="px-3 py-2 text-slate-700">{row.name}</td><td className="px-3 py-2 text-slate-500">{row.email}</td><td className="px-3 py-2 text-slate-500">{row.course}</td><td className="px-3 py-2 text-slate-500">{row.age}</td></tr>)}</tbody></table></div>}<div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button><button disabled={!rows.length || importing} onClick={importData} className="inline-flex items-center gap-2 rounded-lg bg-cyan-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"><Upload size={14} />{importing ? 'Importing…' : `Import ${rows.length} records`}</button></div></div></div></div>
}
