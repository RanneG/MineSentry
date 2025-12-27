import { useEffect, useState } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

let toastListeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  warning: (message: string) => addToast(message, 'warning'),
  info: (message: string) => addToast(message, 'info'),
}

function addToast(message: string, type: Toast['type']) {
  const id = Math.random().toString(36).substring(7)
  const newToast: Toast = { id, message, type }
  toasts = [...toasts, newToast]
  notifyListeners()

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notifyListeners()
  }, 5000)
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]))
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.push(setCurrentToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setCurrentToasts)
    }
  }, [])

  if (currentToasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] px-4 py-3 rounded-lg shadow-lg border ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500 text-green-400'
              : toast.type === 'error'
              ? 'bg-red-500/20 border-red-500 text-red-400'
              : toast.type === 'warning'
              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
              : 'bg-blue-500/20 border-blue-500 text-blue-400'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

