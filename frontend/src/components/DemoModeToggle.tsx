import { useDemoMode } from '@/contexts/DemoModeContext'
import { Play, Square } from 'lucide-react'

export default function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  return (
    <button
      onClick={toggleDemoMode}
      className={`fixed bottom-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
        isDemoMode
          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50'
          : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50'
      }`}
      title={isDemoMode ? 'Demo mode is ON - Click to disable' : 'Demo mode is OFF - Click to enable'}
    >
      {isDemoMode ? (
        <>
          <Play size={16} className="fill-current" />
          <span>Demo Mode ON</span>
        </>
      ) : (
        <>
          <Square size={16} />
          <span>Demo Mode OFF</span>
        </>
      )}
    </button>
  )
}
