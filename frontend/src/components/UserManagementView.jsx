import { Fragment, useState } from 'react'
import { Power, ShieldCheck, Trash2, UserPlus } from 'lucide-react'

const roleLabels = {
  super_admin: 'Super admin', admin: 'Admin', director: 'Director', head: 'Department head',
  teacher: 'Teacher', student: 'Student', parent: 'Parent', guest: 'Guest',
}

export default function UserManagementView({ users, roles, students, instructors, currentUser, onCreate, onUpdate, onDelete }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'guest', student: '', instructor: '', department: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const usersByRole = users.reduce((groups, user) => {
    const role = roleLabels[user.role] || user.role
    groups[role] = [...(groups[role] || []), user]
    return groups
  }, {})

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form }
      if (!payload.student) delete payload.student
      if (!payload.instructor) delete payload.instructor
      if (!payload.department) delete payload.department
      await onCreate(payload)
      setForm({ name: '', email: '', password: '', role: 'guest', student: '', instructor: '', department: '' })
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message || 'Unable to create account.')
    } finally { setSaving(false) }
  }

  return <section className="space-y-5">
    <div><h1 className="text-xl font-bold text-slate-900">Account access</h1><p className="mt-1 text-xs text-slate-500">Manage identities and role assignments.</p></div>
    <form id="user-account-form" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-4" onSubmit={submit}>
      <label className="text-xs font-semibold text-slate-700">Name<input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" onChange={(event) => update('name', event.target.value)} required value={form.name} /></label>
      <label className="text-xs font-semibold text-slate-700">Email<input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" onChange={(event) => update('email', event.target.value)} required type="email" value={form.email} /></label>
      <label className="text-xs font-semibold text-slate-700">Temporary password<input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" minLength="10" onChange={(event) => update('password', event.target.value)} required type="password" value={form.password} /></label>
      <label className="text-xs font-semibold text-slate-700">Role<select className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs" onChange={(event) => update('role', event.target.value)} value={form.role}>{roles.map((role) => <option key={role} value={role}>{roleLabels[role] || role}</option>)}</select></label>
      {['student', 'parent'].includes(form.role) && <label className="text-xs font-semibold text-slate-700">Linked student<select className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs" onChange={(event) => update('student', event.target.value)} required value={form.student}><option value="">Choose student</option>{students.map((student) => <option key={student._id} value={student._id}>{student.name} · {student.email}</option>)}</select></label>}
      {form.role === 'teacher' && <label className="text-xs font-semibold text-slate-700">Instructor record<select className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs" onChange={(event) => update('instructor', event.target.value)} required value={form.instructor}><option value="">Choose instructor</option>{instructors.map((instructor) => <option key={instructor._id} value={instructor._id}>{instructor.name} · {instructor.department}</option>)}</select></label>}
      {['head', 'director'].includes(form.role) && <label className="text-xs font-semibold text-slate-700">Department<input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" onChange={(event) => update('department', event.target.value)} required value={form.department} /></label>}
      <div className="flex items-end"><button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-900 px-4 text-xs font-semibold text-white disabled:opacity-60" disabled={saving} type="submit"><UserPlus size={15} />Create account</button></div>
      {error && <p className="text-xs text-rose-700 md:col-span-2 xl:col-span-4" role="alert">{error}</p>}
    </form>
    <div id="user-account-list" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-slate-50 text-[9px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{Object.entries(usersByRole).map(([role, roleUsers]) => <Fragment key={role}>
      <tr className="border-t border-slate-100 bg-slate-50/80"><td className="px-4 py-2.5" colSpan="4"><span className="text-[10px] font-bold uppercase tracking-wide text-cyan-900">{role}</span><span className="ml-2 text-[10px] text-slate-500">{roleUsers.length} account{roleUsers.length === 1 ? '' : 's'}</span></td></tr>
      {roleUsers.map((user) => <tr className="border-t border-slate-100 text-xs" key={user._id}>
        <td className="px-4 py-3"><span className="block font-semibold text-slate-800">{user.name}</span><span className="text-[10px] text-slate-500">{user.email}</span><span className="mt-1 block text-[10px] text-slate-500">{user.student ? `Student · ${user.student.program || user.student.course} ${user.student.academicYear || ''} ${user.student.division ? `Div ${user.student.division}` : ''}` : user.instructor ? `Faculty · ${user.instructor.department} · ${user.instructor.designation}` : user.department || 'No linked campus profile'}</span></td>
        <td className="px-4 py-3"><div className="space-y-1">{user.developmentAccount && <span className="block w-fit rounded-full bg-cyan-50 px-2.5 py-1 text-[9px] font-semibold text-cyan-800">Sample test account</span>}{user.role === 'dev' ? <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold text-cyan-800">Role switcher</span> : <select aria-label={`Role for ${user.email}`} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs" disabled={user._id === currentUser._id || user.developmentAccount} onChange={(event) => onUpdate(user._id, { role: event.target.value })} value={user.role}>{roles.map((role) => <option key={role} value={role}>{roleLabels[role] || role}</option>)}</select>}</div></td>
        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] ${user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><ShieldCheck size={12} />{user.active ? 'Active' : 'Disabled'}</span></td>
        <td className="px-4 py-3"><div className="flex gap-1"><button aria-label={`${user.active ? 'Disable' : 'Enable'} account ${user.email}`} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40" disabled={user._id === currentUser._id} onClick={() => onUpdate(user._id, { active: !user.active })} type="button"><Power size={14} /></button><button aria-label={`Delete account ${user.email}`} className="grid size-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-40" disabled={user._id === currentUser._id} onClick={() => onDelete(user)} type="button"><Trash2 size={14} /></button></div></td>
      </tr>)}
    </Fragment>)}</tbody></table></div></div>
  </section>
}
