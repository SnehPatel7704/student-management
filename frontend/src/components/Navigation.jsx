import { Activity, BookOpen, GraduationCap, LayoutDashboard, Library, Medal, Network, School, UsersRound } from 'lucide-react'

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
]

export default function Navigation({ activeView, onChange, health }) {
  const status = health.status === 'ok' ? 'bg-emerald-500' : health.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-500'
  return (
    <nav aria-label="Campus ERP modules" className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-3 sm:px-8">
        <div className="mr-auto flex min-w-max items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-cyan-900 text-white"><School size={16} /></span>
          <span className="text-xs font-bold text-slate-800">Campus<span className="text-cyan-800">desk</span></span>
        </div>
        <div className="flex min-w-max gap-1">
          {tabs.map(({ id, icon: Icon }) => (
            <button key={id} type="button" onClick={() => onChange(id)} aria-current={activeView === id ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium transition ${activeView === id ? 'bg-cyan-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Icon size={14} />{id}
            </button>
          ))}
        </div>
        <span className={`ml-2 hidden min-w-max items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold sm:flex ${health.status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          <span className={`size-1.5 rounded-full ${status}`} />{health.database === 'connected' ? 'DB live' : 'DB down'}
        </span>
      </div>
    </nav>
  )
}
