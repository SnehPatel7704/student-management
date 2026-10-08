import { useEffect, useState } from 'react'
import { X, UserRoundPlus, LoaderCircle } from 'lucide-react'

const EMPTY_FORM = { name: '', email: '', course: '', age: '' }

export default function StudentModal({ student, saving, onClose, onSubmit }) {
  const [form, setForm] = useState(student ? { name: student.name, email: student.email, course: student.course, age: String(student.age) } : EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, saving])

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter the student’s full name.'
    else if (form.name.trim().length > 80) nextErrors.name = 'Name must be 80 characters or fewer.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) nextErrors.email = 'Enter a valid RFC 5322-style email address.'
    if (!form.course.trim()) nextErrors.course = 'Enter a course name.'
    const age = Number(form.age)
    if (!Number.isInteger(age) || age < 1 || age > 120) nextErrors.age = 'Age must be a whole number from 1 to 120.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    const saved = await onSubmit({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      course: form.course.trim(),
      age: Number(form.age),
    })
    if (saved) onClose()
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function normalizeField(field) {
    if (field === 'email') setForm((current) => ({ ...current, email: current.email.trim().toLowerCase() }))
    if (field === 'name') setForm((current) => ({ ...current, name: current.name.trim() }))
  }

  const inputClass = (field) => `mt-1.5 h-10 w-full rounded-lg border bg-white px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${errors[field] ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-cyan-700 focus:ring-cyan-700/10'}`

  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
    <section aria-labelledby="student-modal-title" aria-modal="true" className="h-full w-full max-w-[480px] overflow-y-auto bg-white shadow-2xl" role="dialog" style={{ animation: 'drawer-in 240ms ease-out both' }}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
        <div><span className="mb-2 grid size-9 place-items-center rounded-xl bg-cyan-50 text-cyan-800"><UserRoundPlus size={18} /></span><p className="text-[9px] font-semibold tracking-[0.12em] text-cyan-800">STUDENT RECORD</p><h2 className="mt-1 font-['Manrope'] text-xl font-bold text-slate-900" id="student-modal-title">{student ? 'Edit student' : 'Add a student'}</h2><p className="mt-1 text-xs text-slate-500">{student ? 'Update the details for this student.' : 'Create a record in your student directory.'}</p></div>
        <button aria-label="Close student form" className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" disabled={saving} onClick={onClose} type="button"><X size={18} /></button>
      </div>
      <form className="flex min-h-[calc(100%-124px)] flex-col px-6 py-6 sm:px-8" noValidate onSubmit={handleSubmit}>
        <div className="space-y-5">
          <label className="block text-xs font-semibold text-slate-700" htmlFor="student-name">Full name<input autoComplete="name" className={inputClass('name')} id="student-name" maxLength="80" minLength="1" onBlur={(event) => normalizeField('name')} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Rahul Sharma" required value={form.name} />{errors.name && <span className="mt-1 block text-[10px] font-normal text-rose-600">{errors.name}</span>}</label>
          <label className="block text-xs font-semibold text-slate-700" htmlFor="student-email">Email address<input autoComplete="email" className={inputClass('email')} id="student-email" maxLength="254" onBlur={(event) => normalizeField('email')} onChange={(event) => updateField('email', event.target.value)} pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$" placeholder="name@college.edu" required type="email" value={form.email} />{errors.email && <span className="mt-1 block text-[10px] font-normal text-rose-600">{errors.email}</span>}</label>
          <label className="block text-xs font-semibold text-slate-700" htmlFor="student-course">Course<input className={inputClass('course')} id="student-course" maxLength="80" onChange={(event) => updateField('course', event.target.value)} placeholder="e.g. MCA" required value={form.course} />{errors.course && <span className="mt-1 block text-[10px] font-normal text-rose-600">{errors.course}</span>}</label>
          <label className="block text-xs font-semibold text-slate-700" htmlFor="student-age">Age<input className={inputClass('age')} id="student-age" max="120" min="1" onChange={(event) => updateField('age', event.target.value)} placeholder="1–120" required step="1" type="number" value={form.age} />{errors.age && <span className="mt-1 block text-[10px] font-normal text-rose-600">{errors.age}</span>}</label>
        </div>
        <div className="mt-auto flex gap-2 border-t border-slate-100 pt-6">
          <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-900 px-4 text-xs font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60" disabled={saving} type="submit">{saving ? <><LoaderCircle className="animate-spin" size={15} />Saving record…</> : student ? 'Save changes' : 'Create student'}</button>
          <button className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50" disabled={saving} onClick={onClose} type="button">Cancel</button>
        </div>
      </form>
    </section>
  </div>
}