import { useState } from 'react'
import { Bell, ChevronDown, GraduationCap, HelpCircle } from 'lucide-react'

export default function Header({ apiStatus, onRefresh }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <a className="flex items-center gap-3 text-slate-900 no-underline" href="#top" aria-label="Campus roster dashboard">
          <span className="grid size-9 place-items-center rounded-[10px] bg-cyan-900 text-lime-200 shadow-sm">
            <GraduationCap size={21} strokeWidth={1.8} />
          </span>
          <span className="font-['Manrope'] text-[15px] font-extrabold tracking-normal">campus<span className="font-medium text-cyan-800">desk</span></span>
        </a>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 sm:flex" type="button" onClick={onRefresh} title="Refresh dashboard data">
            <span className={`size-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500' : apiStatus === 'checking' ? 'animate-pulse bg-amber-400' : 'bg-rose-500'}`} />
            API {apiStatus === 'connected' ? 'Connected' : apiStatus === 'checking' ? 'Checking' : 'Unavailable'}
          </button>
          <div className="relative">
            <button aria-label="Notifications" aria-expanded={showNotifications} className="relative grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }} type="button">
              <Bell size={18} />
              {apiStatus === 'error' && <span className="absolute right-[7px] top-[7px] size-2 rounded-full border-2 border-white bg-rose-500" />}
            </button>
            {showNotifications && <div className="absolute right-0 top-11 z-40 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="mb-2 text-xs font-semibold text-slate-900">System notifications</p>
              <p className="text-xs leading-5 text-slate-500">{apiStatus === 'connected' ? 'All services are operating normally.' : apiStatus === 'checking' ? 'Checking the student API connection…' : 'The student API is unavailable. Refresh to check again.'}</p>
            </div>}
          </div>
          <span className="hidden h-7 w-px bg-slate-200 sm:block" />
          <div className="relative">
            <button aria-expanded={showProfile} className="flex items-center gap-2 rounded-lg p-1 text-left transition hover:bg-slate-50" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }} type="button">
              <span className="grid size-8 place-items-center rounded-full bg-[#e8eaf7] text-[11px] font-bold text-[#465381]">AD</span>
              <span className="hidden sm:block"><span className="block text-xs font-semibold leading-4 text-slate-800">Sneh Patel</span><span className="block text-[10px] leading-4 text-slate-500">Administrator</span></span>
              <ChevronDown className="hidden text-slate-400 sm:block" size={14} />
            </button>
            {showProfile && <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="text-xs font-semibold text-slate-900">Sneh Patel</p>
              <p className="mt-1 text-[11px] text-slate-500">admin@campusdesk.edu</p>
              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500"><HelpCircle size={14} /> Campus administrator</div>
            </div>}
          </div>
        </div>
      </div>
    </header>
  )
}