import { useEffect, useState } from 'react'
import { LoaderCircle, X } from 'lucide-react'

const ENTITY_CONFIG = {
  course: {
    title: 'Add course',
    description: 'Create an academic program and assign its primary instructor.',
    fields: (instructors) => [
      ['code', 'Course code', 'text', { required: true }],
      ['title', 'Program title', 'text', { required: true }],
      ['department', 'Department', 'text', { required: true }],
      ['credits', 'Credits', 'number', { min: 1, max: 6, defaultValue: 3 }],
      ['capacity', 'Capacity', 'number', { min: 1, defaultValue: 30 }],
      ['instructor', 'Instructor', 'select', { options: instructors.map((item) => ({ value: item._id, label: item.name })) }],
    ],
  },
  instructor: {
    title: 'Add instructor',
    description: 'Add a faculty member to the academic roster.',
    fields: () => [
      ['name', 'Name', 'text', { required: true }],
      ['staffId', 'Staff ID', 'text', { required: true }],
      ['department', 'Department', 'text', { required: true }],
      ['designation', 'Designation', 'text', { required: true }],
      ['email', 'Email', 'email', { required: true }],
    ],
  },
  internship: {
    title: 'Post opportunity',
    description: 'Publish a placement opportunity for students.',
    fields: () => [
      ['company', 'Company', 'text', { required: true }],
      ['role', 'Role', 'text', { required: true }],
      ['stipend', 'Stipend', 'number', { min: 0, defaultValue: 0 }],
      ['workMode', 'Work mode', 'select', { options: [{ value: 'Remote', label: 'Remote' }, { value: 'On-site', label: 'On-site' }, { value: 'Hybrid', label: 'Hybrid' }] }],
      ['deadline', 'Deadline', 'date', { required: true }],
    ],
  },
  club: {
    title: 'Create club',
    description: 'Create a student community with an assigned coordinator.',
    fields: (instructors) => [
      ['name', 'Club name', 'text', { required: true }],
      ['category', 'Category', 'select', { options: [{ value: 'Technical', label: 'Technical' }, { value: 'Cultural', label: 'Cultural' }, { value: 'Sports', label: 'Sports' }, { value: 'Social', label: 'Social' }] }],
      ['lead', 'Coordinator', 'select', { options: instructors.map((item) => ({ value: item._id, label: item.name })) }],
    ],
  },
  book: {
    title: 'Add book',
    description: 'Add library inventory and make its availability explicit.',
    fields: () => [
      ['isbn', 'ISBN', 'text', { required: true }],
      ['title', 'Title', 'text', { required: true }],
      ['author', 'Author', 'text', { required: true }],
      ['category', 'Category', 'text', { required: true }],
      ['totalCopies', 'Total copies', 'number', { min: 1, defaultValue: 1 }],
      ['availableCopies', 'Available copies', 'number', { min: 0, defaultValue: 1 }],
    ],
  },
}

export default function EntityFormModal({ entityType, instructors, onClose, onSubmit }) {
  const config = ENTITY_CONFIG[entityType]
  const [form, setForm] = useState(() => Object.fromEntries(config.fields(instructors).map(([field, , , options]) => [field, options?.defaultValue ?? ''])))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const handleKeyDown = (event) => event.key === 'Escape' && !saving && onClose()
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saving, onClose])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}
    const requiredFields = config.fields(instructors).filter(([, , , options]) => options?.required)
    for (const [field] of requiredFields) {
      if (String(form[field] ?? '').trim() === '') nextErrors[field] = 'This field is required.'
    }
    for (const field of ['credits', 'capacity', 'stipend', 'totalCopies', 'availableCopies']) {
      const value = Number(form[field])
      const options = config.fields(instructors).find(([name]) => name === field)?.[3]
      if (form[field] !== '' && (!Number.isFinite(value) || (options?.min !== undefined && value < options.min) || (options?.max !== undefined && value > options.max))) {
        nextErrors[field] = `Value must be between ${options?.min ?? '0'} and ${options?.max ?? 'unlimited'}.`
      }
    }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return
    setError('')
    setSaving(true)
    try {
      const payload = { ...form }
      for (const field of ['credits', 'capacity', 'stipend', 'totalCopies', 'availableCopies']) {
        if (payload[field] !== undefined && payload[field] !== '') payload[field] = Number(payload[field])
      }
      if (payload.instructor === '') delete payload.instructor
      if (payload.lead === '') delete payload.lead
      if (payload.deadline) payload.deadline = new Date(payload.deadline).toISOString()
      await onSubmit(payload)
      onClose()
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || 'Unable to save this record.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section aria-modal="true" className="h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-2xl" role="dialog">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div><p className="text-[9px] font-semibold tracking-[0.14em] text-cyan-800">CREATE RECORD</p><h2 className="mt-1 text-xl font-bold text-slate-900">{config.title}</h2><p className="mt-1 text-xs text-slate-500">{config.description}</p></div>
          <button aria-label="Close form" className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" disabled={saving} onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <form className="flex min-h-[calc(100%-150px)] flex-col px-6 py-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields(instructors).map(([field, label, type, options]) => (
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
            <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-900 px-4 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60" disabled={saving} type="submit">{saving ? <><LoaderCircle className="animate-spin" size={15} />Saving…</> : 'Create record'}</button>
            <button className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-medium text-slate-600" disabled={saving} onClick={onClose} type="button">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  )
}
