import { useState } from 'react'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  text: string
  className?: string
}

export default function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        className="text-text-secondary hover:text-text transition-colors focus:outline-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`Info: ${text}`}
      >
        <Info size={16} className="ml-1" />
      </button>
      {showTooltip && (
        <div className="absolute left-0 top-6 z-50 w-64 p-2 bg-surface-light border border-border rounded-lg shadow-lg text-xs text-text">
          {text}
          <div className="absolute -top-1 left-3 w-2 h-2 bg-surface-light border-l border-t border-border transform rotate-45"></div>
        </div>
      )}
    </div>
  )
}

