import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  change?: string
}

export default function StatsCard({ title, value, icon: Icon, iconColor = 'text-primary', change }: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {change && <p className="text-text-muted text-xs mt-1">{change}</p>}
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </div>
  )
}

