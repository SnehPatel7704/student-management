import { Download, Plus, Search, Trash2 } from 'lucide-react'

export default function FilterToolbar({
  search, onSearch, courses, selectedCourse, onCourse, sort, onSort,
  onExport, onAdd, selectedCount, onDeleteSelected,
}) {
  return <section aria-label="Student filters" className="border-b border-slate-100 px-4 py-4 sm:px-5">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1 sm:max-w-[330px]">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <span className="sr-only">Search name, email or course</span>
          <input className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:bg-white focus:ring-2 focus:ring-cyan-700/10" onChange={(event) => onSearch(event.target.value)} placeholder="Search name, email, course..." type="search" value={search} />
        </label>
        <div aria-label="Filter by course" className="flex max-w-full gap-1 overflow-x-auto pb-0.5">
          {['All courses', ...new Set(courses.filter((course) => course !== 'All courses'))].map((course) => <button aria-pressed={selectedCourse === course} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-medium transition ${selectedCourse === course ? 'bg-cyan-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} key={course} onClick={() => onCourse(course)} type="button">{course}</button>)}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="student-sort">Sort students</label>
        <select className="h-9 min-w-[143px] rounded-lg border border-slate-200 bg-white px-3 text-[11px] text-slate-600 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/10" id="student-sort" onChange={(event) => onSort(event.target.value)} value={sort}>
          <option value="date-desc">Recently added</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="age-asc">Age: low to high</option><option value="age-desc">Age: high to low</option>
        </select>
        <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50" onClick={onExport} type="button"><Download size={14} /> <span className="hidden sm:inline">Export CSV</span></button>
        {selectedCount > 0 && <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-[11px] font-medium text-rose-700 transition hover:bg-rose-50" onClick={onDeleteSelected} type="button"><Trash2 size={14} /><span>Delete ({selectedCount})</span></button>}
        <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-cyan-900 px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-cyan-800" onClick={onAdd} type="button"><Plus size={15} /><span>Add student</span></button>
      </div>
    </div>
  </section>
}