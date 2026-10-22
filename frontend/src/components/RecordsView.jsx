import { Fragment } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import usePermissions from '../hooks/usePermissions'

export default function RecordsView({ title, description, records, columns, createLabel, onCreate, onEdit, onDelete, extraActions, footer, extraPermission, groupBy, id }) {
  const rolePermissions = usePermissions()
  const managePermissions = {
    'Course catalog': 'courses.manage', 'Faculty roster': 'instructors.manage',
    'Internship opportunities': 'internships.manage', 'Club directory': 'clubs.manage',
    'Library inventory': 'library.manage', 'Attendance register': 'attendance.manage',
    'Academic performance': 'grades.manage',
  }
  const actionPermissions = {
    'Internship opportunities': 'internships.apply', 'Club directory': 'clubs.join', 'Library inventory': 'library.borrow',
  }
  const canManage = rolePermissions.includes('*') || rolePermissions.includes(managePermissions[title])
  const actionPermission = extraPermission || actionPermissions[title]
  const canUseExtraAction = rolePermissions.includes('*') || (Array.isArray(actionPermission)
    ? actionPermission.some((permission) => rolePermissions.includes(permission))
    : rolePermissions.includes(actionPermission))
  const showActions = canManage || (Boolean(extraActions) && canUseExtraAction)
  const grouping = groupBy || {
    'Course catalog': (record) => record.department,
    'Faculty roster': (record) => `${record.department || 'Unassigned department'} · ${record.designation || 'Role unassigned'}`,
    'Internship opportunities': (record) => record.company,
    'Club directory': (record) => record.category,
    'Library inventory': (record) => record.category,
    'Attendance register': (record) => record.lecture
      ? `${record.lecture.program} ${record.lecture.academicYear} · Division ${record.lecture.division} · ${record.lecture.department}`
      : record.course?.code || record.course || 'Legacy records',
    'Academic performance': (record) => record.course?.code || record.course?.title || record.course,
  }[title]
  const groupedRecords = grouping
    ? records.reduce((groups, record) => {
      const label = grouping(record) || 'Unassigned'
      groups[label] = [...(groups[label] || []), record]
      return groups
    }, {})
    : { '': records }
  const sectionId = id || ({ 'Course catalog': 'course-catalog', 'Faculty roster': 'faculty-directory' }[title] || 'records-view')
  return <section className="space-y-5" id={sectionId}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-bold text-slate-900">{title}</h1><p className="mt-1 text-xs text-slate-500">{description}</p></div>
      {canManage && createLabel && <button className="inline-flex items-center gap-2 rounded-lg bg-cyan-900 px-4 py-2 text-xs font-semibold text-white" onClick={onCreate} type="button"><Plus size={15} />{createLabel}</button>}
    </div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50 text-[9px] font-semibold uppercase tracking-wider text-slate-500"><tr>{columns.map((column) => <th className="px-4 py-3" key={column.label}>{column.label}</th>)}{showActions && <th className="px-4 py-3">Actions</th>}</tr></thead>
          <tbody>{Object.entries(groupedRecords).map(([group, groupRecords]) => <Fragment key={group || 'all'}>
            {grouping && <tr className="border-t border-slate-100 bg-slate-50/80"><td className="px-4 py-2.5" colSpan={columns.length + Number(showActions)}><span className="text-[10px] font-bold uppercase tracking-wide text-cyan-900">{group}</span><span className="ml-2 text-[10px] text-slate-500">{groupRecords.length} record{groupRecords.length === 1 ? '' : 's'}</span></td></tr>}
            {groupRecords.map((record) => <tr className="border-t border-slate-100 text-xs" key={record._id}>{columns.map((column) => <td className="px-4 py-3 text-slate-600" key={column.label}>{column.render(record)}</td>)}{showActions && <td className="px-4 py-2"><div className="flex items-center gap-1">{canUseExtraAction && extraActions?.(record)}{canManage && <><button aria-label={`Edit ${title}: ${record._id}`} className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => onEdit(record)} type="button"><Pencil size={14} /></button><button aria-label={`Delete ${title}: ${record._id}`} className="grid size-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50" onClick={() => onDelete(record)} type="button"><Trash2 size={14} /></button></>}</div></td>}</tr>)}
          </Fragment>)}</tbody>
        </table>
      </div>
      {records.length === 0 && <p className="p-8 text-center text-xs text-slate-500">{createLabel ? `No records yet. Use “${createLabel}” to add the first one.` : 'No records found.'}</p>}
    </div>
    {footer}
  </section>
}
