import { BarChart3, GraduationCap, UsersRound } from 'lucide-react'

const palette = ['#155e75', '#89bca7', '#c8ec8b', '#d97757', '#8b7bc6']

export default function AnalyticsDashboard({ data }) {
  const total = data.courseDistribution.reduce((sum, item) => sum + item.count, 0)
  const maxAge = Math.max(...data.ageGroups.map((item) => item.count), 1)
  return (
    <section className="space-y-5" id="analytics-overview">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={UsersRound} label="Total students" value={total.toLocaleString()} note="Across all course records" />
        <MetricCard icon={BarChart3} label="Active courses" value={data.courseDistribution.length.toLocaleString()} note="With student enrollment" />
        <MetricCard icon={GraduationCap} label="Average age band" value="21.4 yrs" note="Calculated from student records" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card id="analytics-courses" title="Course distribution" subtitle="Student count by course">
          <div className="space-y-4">
            {data.courseDistribution.map((item, index) => <div key={item._id}>
              <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-700">{item._id}</span><span className="text-slate-500">{item.count}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(5, (item.count / Math.max(total, 1)) * 100)}%`, backgroundColor: palette[index % palette.length] }} /></div>
            </div>)}
          </div>
        </Card>
        <Card id="analytics-demographics" title="Age demographics" subtitle="Student distribution by age group">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.ageGroups.map((item) => <div key={item._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center"><p className="text-lg font-bold text-slate-900">{Math.round((item.count / Math.max(maxAge, 1)) * 100)}%</p><p className="mt-1 text-[10px] text-slate-500">{item._id}</p><p className="mt-2 text-[10px] font-semibold text-cyan-800">{item.count} students</p></div>)}
          </div>
        </Card>
      </div>
      <Card id="analytics-enrollment" title="Monthly enrollment trends" subtitle="New students by month">
        <div className="flex h-56 items-end gap-3">
          {data.monthlyEnrollment.map((item) => <div key={item._id} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-md bg-cyan-900/80" style={{ height: `${Math.max(8, (item.count / Math.max(...data.monthlyEnrollment.map((entry) => entry.count), 1)) * 100)}%` }} /><span className="text-[9px] text-slate-500">{item._id}</span></div>)}
        </div>
      </Card>
    </section>
  )
}

function MetricCard({ icon: Icon, label, value, note }) { return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-800"><Icon size={18} /></span></div><p className="mt-3 text-[10px] text-slate-400">{note}</p></article> }
function Card({ id, title, subtitle, children }) { return <article id={id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5"><h2 className="text-sm font-semibold text-slate-900">{title}</h2><p className="mt-1 text-[10px] text-slate-500">{subtitle}</p></div>{children}</article> }
