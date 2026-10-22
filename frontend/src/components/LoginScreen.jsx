import { useState } from 'react'
import { KeyRound, LoaderCircle, School } from 'lucide-react'

const sampleAccounts = [
  ['super_admin', 'sample.superadmin@campusdesk.local'],
  ['admin', 'sample.admin@campusdesk.local'],
  ['director', 'sample.director@campusdesk.local'],
  ['head', 'sample.head@campusdesk.local'],
  ['teacher', 'sample.teacher@campusdesk.local'],
  ['student', 'sample.student@campusdesk.local'],
  ['parent', 'sample.parent@campusdesk.local'],
  ['guest', 'sample.guest@campusdesk.local'],
  ['director (Mechanical Engineering)', 'sample.director.mechanical@campusdesk.local'],
  ['student (Maya Patel)', 'sample.student.maya@campusdesk.local'],
]

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try { await onLogin({ email, password }) } catch (loginError) {
      setError(loginError.response?.data?.message || 'Unable to sign in.')
    } finally { setSubmitting(false) }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
    <section className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-7 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-cyan-900 text-white"><School size={19} /></span><div><h1 className="text-lg font-bold text-slate-900">Campusdesk</h1><p className="text-xs text-slate-500">Sign in to your campus account</p></div></div>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-xs font-semibold text-slate-700">Email<input autoComplete="username" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/10" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label className="block text-xs font-semibold text-slate-700">Password<input autoComplete="current-password" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/10" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
        {import.meta.env.DEV && <div className="space-y-1.5 rounded-lg bg-cyan-50 p-3">
          <label className="block text-[11px] font-semibold text-cyan-900">Development sample account
            <select className="mt-1.5 h-9 w-full rounded-lg border border-cyan-200 bg-white px-3 text-xs" onChange={(event) => event.target.value && setEmail(event.target.value)} value="">
              <option value="">Choose a role account</option>
              {sampleAccounts.map(([role, accountEmail]) => <option key={role} value={accountEmail}>{role.replaceAll('_', ' ')} · {accountEmail}</option>)}
            </select>
          </label>
          <p className="text-[10px] leading-4 text-cyan-800">Sample accounts use the backend development password configured as DEV_USER_PASSWORD.</p>
        </div>}
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">{error}</p>}
        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-900 text-xs font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">{submitting ? <LoaderCircle className="animate-spin" size={15} /> : <KeyRound size={15} />}Sign in</button>
      </form>
    </section>
  </main>
}
