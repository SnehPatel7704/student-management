import { BookOpen, GraduationCap, UsersRound } from 'lucide-react'

export default function CoursesView({ courses, instructors, onCreate }) {
  const instructorMap = new Map(instructors.map((instructor) => [instructor._id, instructor]))
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold text-slate-900">Course catalog</h1><p className="mt-1 text-xs text-slate-500">Academic programs, capacity, and faculty ownership.</p></div><button onClick={onCreate} className="rounded-lg bg-cyan-900 px-4 py-2 text-xs font-semibold text-white">Add course</button></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => {
        const instructor = instructorMap.get(course.instructor?._id || course.instructor)
        const enrolled = Math.max(0, course.capacity - course.students?.length)
        return <article key={course._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><span className="rounded-lg bg-cyan-50 px-3 py-1.5 text-[10px] font-bold text-cyan-800">{course.code}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-semibold text-amber-700">{course.credits} credits</span></div><h2 className="mt-4 text-sm font-semibold text-slate-900">{course.title}</h2><p className="mt-1 text-[10px] text-slate-500">{course.department}</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-[10px]"><span className="flex items-center gap-2 text-slate-500"><GraduationCap size={13} />{instructor?.name || 'Unassigned'}</span><span className="flex items-center gap-2 text-slate-500"><UsersRound size={13} />{enrolled} capacity</span></div><div className="mt-4 flex items-center gap-2"><BookOpen size={13} className="text-emerald-600" /><span className="text-[10px] font-semibold text-emerald-700">{course.capacity - enrolled} seats available</span></div></article>
      })}
    </div>
  </section>
}
