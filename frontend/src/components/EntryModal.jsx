import { useEffect, useState } from 'react'
import { LoaderCircle, Plus, X } from 'lucide-react'

const ENTRY_CONFIG = {
  attendance: {
    title: 'Log attendance',
    description: 'Record daily attendance for a student and course.',
    fields: (students, courses) => [
      ['student', 'Student', 'select', { required: true, options: students.map((item) => ({ value: item._id, label: item.name })) }],
      ['course', 'Course', 'select', { required: true, options: courses.map((item) => ({ value: item._id, label: item.code })) }],
      ['date', 'Attendance date', 'date', { required: true, defaultValue: new Date().toISOString().slice(0, 10) }],
      ['status', 'Status', 'select', { defaultValue: 'Present', options: [{ value: 'Present', label: 'Present' }, { value: 'Absent', label: 'Absent' }, { value: 'Excused', label: 'Excused' }] }],
    ],
  },
  grade: {
    title: 'Record grades',
    description: 'Add marks for a student’s exam result.',
    fields: (students, courses) => [
      ['student', 'Student', 'select', { required: true, options: students.map((item) => ({ value: item._id, label: item.name })) }],
      ['course', 'Course', 'select', { required: true, options: courses.map((item) => ({ value: item._id, label: item.code })) }],
      ['examType', 'Exam', 'select', { required: true, options: [{ value: 'Midterm', label: 'Midterm' }, { value: 'Final', label: 'Final' }, { value: 'Practical', label: 'Practical' }] }],
      ['marksObtained', 'Marks obtained', 'number', { required: true, min: 0, defaultValue: 0 }],
      ['maxMarks', 'Maximum marks', 'number', { required: true, min: 1, defaultValue: 100 }],
    ],
  },
}

export default function EntryModal({ entryType, students, courses, initialValue, onClose, onSubmit }) {
  const config = ENTRY_CONFIG[entryType]
  const fields = config.fields(students, courses)
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(([field, , , options]) => {
    const value = initialValue?.[field]
    const normalized = value && typeof value === 'object' ? value._id : value
    return [field, normalized == null ? options?.defaultValue ?? '' : field === 'date' ? new Date(normalized).toISOString().slice(0, 10) : normalized]
  })))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && !saving && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, saving])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    fields.forEach(([field, , , options]) => {
      if (options?.required && String(form[field] ?? '').trim() === '') nextErrors[field] = 'This field is required.'
      if (['marksObtained', 'maxMarks'].includes(field)) {
        const value = Number(form[field])
        if (!Number.isFinite(value) || value < (options.min ?? 0)) nextErrors[field] = 'Enter a valid numeric value.'
      }
    })
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)
    setError('')
    try {
      const payload = { ...form }
      if (entryType === 'grade') {
        payload.marksObtained = Number(payload.marksObtained)
        payload.maxMarks = Number(payload.maxMarks)
      }
      if (entryType === 'attendance' && payload.date) payload.date = new Date(`${payload.date}T00:00:00`).toISOString()
      await onSubmit(payload)
      onClose()
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || 'Unable to save this entry.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section aria-modal="true" aria-labelledby="entry-modal-title" className="h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-2xl" role="dialog">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div><p className="text-[9px] font-semibold tracking-[0.14em] text-cyan-800">{initialValue ? 'EDIT ENTRY' : 'NEW ENTRY'}</p><h2 className="mt-1 text-xl font-bold text-slate-900" id="entry-modal-title">{initialValue ? `Edit ${entryType}` : config.title}</h2><p className="mt-1 text-xs text-slate-500">{config.description}</p></div>
          <button aria-label="Close entry form" className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" disabled={saving} onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <form className="flex min-h-[calc(100%-150px)] flex-col px-6 py-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([field, label, type, options]) => (
              <label className="block text-xs font-semibold text-slate-700" key={field}>
                {label}
                {type === 'select' ? (
                  <select className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/10" onChange={(event) => update(field, event.target.value)} value={form[field]}>
                    <option value="">Select an option</option>
                    {options.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input className={`mt-1.5 h-10 w-full rounded-lg border bg-white px-3 text-xs outline-none focus:ring-2 ${fieldErrors[field] ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-cyan-700 focus:ring-cyan-700/10'}`} min={options?.min} max={options?.max} required={options?.required} type={type} value={form[field]} onChange={(event) => update(field, event.target.value)} />
                )}
                {fieldErrors[field] && <span className="mt-1 block text-[10px] font-normal text-rose-600">{fieldErrors[field]}</span>}
              </label>
            ))}
          </div>
          {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
          <div className="mt-auto flex gap-2 border-t border-slate-100 pt-6">
            <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-900 px-4 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60" disabled={saving} type="submit">{saving ? <><LoaderCircle className="animate-spin" size={15} />Saving…</> : <><Plus size={15} />{initialValue ? 'Save changes' : 'Save entry'}</>}</button>
            <button className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-medium text-slate-600" disabled={saving} onClick={onClose} type="button">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  )
}
