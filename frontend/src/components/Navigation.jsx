import { useState } from 'react'
import { Activity, BookOpen, GraduationCap, LayoutDashboard, Library, LogOut, Medal, Network, School, ShieldCheck, UsersRound } from 'lucide-react'

const tabs = [
  { id: 'Students', icon: UsersRound },
  { id: 'Analytics', icon: Activity },
  { id: 'Courses', icon: School },
  { id: 'Instructors', icon: GraduationCap },
  { id: 'Internships', icon: Medal },
  { id: 'Attendance', icon: LayoutDashboard },
  { id: 'Clubs', icon: Network },
  { id: 'Library', icon: Library },
  { id: 'Grades', icon: BookOpen },
  { id: 'Portal', icon: UsersRound },
  { id: 'Users', icon: ShieldCheck },
]

const devRoles = ['super_admin', 'admin', 'director', 'head', 'teacher', 'student', 'parent', 'guest']

export default function Navigation({ activeView, onChange, health, views, user, onLogout, onRoleChange }) {
  const [switchingRole, setSwitchingRole] = useState(false)
  const status = health.status === 'ok' ? 'bg-emerald-500' : health.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-500'
  const visibleTabs = tabs.filter(({ id }) => views.includes(id))
  return (
    <nav aria-label="Campus ERP modules" className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-3 sm:px-8">
        <div className="mr-auto flex min-w-max items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-cyan-900 text-white"><School size={16} /></span>
          <span className="text-xs font-bold text-slate-800">Campus<span className="text-cyan-800">desk</span></span>
        </div>
        <div className="flex min-w-max gap-1">
          {visibleTabs.map(({ id, icon: Icon }) => (
            <button key={id} type="button" onClick={() => onChange(id)} aria-current={activeView === id ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium transition ${activeView === id ? 'bg-cyan-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Icon size={14} />{id}
            </button>
          ))}
        </div>
        <span className={`ml-2 hidden min-w-max items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold sm:flex ${health.status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          <span className={`size-1.5 rounded-full ${status}`} />{health.database === 'connected' ? 'DB live' : 'DB down'}
        </span>
        <span className="hidden min-w-max text-right sm:block"><span className="block text-[10px] font-semibold text-slate-800">{user.name}</span><span className="block text-[9px] capitalize text-slate-500">{user.role.replaceAll('_', ' ')}</span></span>
        {import.meta.env.DEV && user.devUser && <label className="flex shrink-0 items-center gap-2 text-[10px] font-semibold text-slate-500">Dev role<select aria-label="Switch development role" className="h-8 rounded-lg border border-cyan-200 bg-cyan-50 px-2 text-[10px] font-semibold capitalize text-cyan-900 disabled:opacity-60" disabled={switchingRole} onChange={async (event) => { setSwitchingRole(true); try { await onRoleChange(event.target.value) } finally { setSwitchingRole(false) } }} value={user.role}>{devRoles.map((role) => <option className="capitalize" key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}</select></label>}
        <button aria-label="Sign out" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onLogout} type="button"><LogOut size={15} /></button>
      </div>
    </nav>
  )
}
