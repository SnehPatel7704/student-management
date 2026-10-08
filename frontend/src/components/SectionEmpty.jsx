export default function SectionEmpty({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}
