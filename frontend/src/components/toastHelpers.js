import { createElement } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const options = {
  duration: 3500,
  position: 'bottom-right',
  style: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.14)',
  },
}

export function showToastSuccess(message) {
  toast.success(message, { ...options, icon: createElement(CheckCircle2, { size: 17, className: 'text-emerald-600' }) })
}

export function showToastError(message) {
  toast.error(message, { ...options, icon: createElement(XCircle, { size: 17, className: 'text-rose-600' }) })
}

export function showToastInfo(message) {
  toast(message, { ...options, icon: createElement(Info, { size: 17, className: 'text-cyan-700' }) })
}
