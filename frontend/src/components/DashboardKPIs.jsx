import { BookOpen, GraduationCap, HeartPulse, UsersRound } from 'lucide-react'

const cards = [
  { key: 'students', label: 'TOTAL STUDENTS', icon: UsersRound, tint: 'bg-cyan-50 text-cyan-800', note: 'Current student records' },
  { key: 'courses', label: 'UNIQUE COURSES', icon: BookOpen, tint: 'bg-violet-50 text-violet-700', note: 'Distinct course assignments' },
  { key: 'age', label: 'AVERAGE AGE', icon: GraduationCap, tint: 'bg-amber-50 text-amber-700', note: 'Across all records' },
  { key: 'api', label: 'DATABASE STATUS', icon: HeartPulse, tint: 'bg-emerald-50 text-emerald-700', note: 'Live MongoDB health check' },
]

export default function DashboardKPIs({ students, apiStatus, databaseStatus }) {
  const averageAge = students.length
    ? (students.reduce((sum, student) => sum + Number(student.age || 0), 0) / students.length).toFixed(1)
    : '—'
  const uniqueCourses = new Set(students.map((student) => student.course?.trim().toLowerCase()).filter(Boolean)).size
  const databaseConnected = apiStatus === 'connected' && databaseStatus === 'connected'
  const values = {
    students: students.length.toLocaleString(),
    courses: uniqueCourses.toLocaleString(),
    age: averageAge,
    api: databaseConnected ? 'Connected' : apiStatus === 'checking' ? 'Checking' : 'Offline',
  }

  return (
    <section aria-label="Student dashboard metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, tint, note }, index) => (
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(22,43,55,0.025)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md" key={key} style={{ animation: `card-in 400ms ${index * 55}ms both` }}>
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[9px] font-semibold tracking-[0.11em] text-slate-500">{label}</p><p className="mt-3 font-['Manrope'] text-[25px] font-bold leading-none text-slate-900">{values[key]}</p></div>
            <span className={`grid size-9 place-items-center rounded-[10px] ${tint}`}><Icon size={17} strokeWidth={1.8} /></span>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className={`size-1.5 rounded-full ${databaseConnected ? 'bg-emerald-500' : apiStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-500'}`} />
            {key === 'api' ? (databaseConnected ? 'MongoDB connected' : 'Health check unavailable') : note}
          </p>
        </article>
      ))}
    </section>
  )
}
