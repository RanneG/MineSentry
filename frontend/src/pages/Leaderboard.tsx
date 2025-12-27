import { useQuery } from '@tanstack/react-query'
import { Trophy, TrendingUp, Award } from 'lucide-react'
import { apiClient } from '@/api/client'

export default function Leaderboard() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
  })

  // TODO: Implement actual leaderboard data from API
  // This is a placeholder structure
  const leaderboardData = [
    { rank: 1, address: 'bc1q...abc123', reports: 15, verified: 12, totalBounty: 0.0125 },
    { rank: 2, address: 'bc1q...def456', reports: 10, verified: 8, totalBounty: 0.008 },
    { rank: 3, address: 'bc1q...ghi789', reports: 8, verified: 6, totalBounty: 0.005 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Leaderboard</h1>
        <p className="text-text-secondary mt-1">Top reporters and contributors</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Total Reports</p>
                <p className="text-2xl font-bold text-text">{stats.total_reports}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Verified Reports</p>
                <p className="text-2xl font-bold text-primary">{stats.verified_reports}</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Total BTC Paid</p>
                <p className="text-2xl font-bold text-primary">{stats.total_bounty_paid_btc.toFixed(4)}</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text mb-4">Top Reporters</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Address</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Reports</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Verified</th>
                <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Total Bounty</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry) => (
                <tr key={entry.rank} className="border-b border-border hover:bg-surface-light transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 && <Trophy className={`w-5 h-5 ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-300' : 'text-amber-600'}`} />}
                      <span className="text-text font-semibold">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-text font-mono text-sm">{entry.address}</span>
                  </td>
                  <td className="py-4 px-4 text-text">{entry.reports}</td>
                  <td className="py-4 px-4 text-text">{entry.verified}</td>
                  <td className="py-4 px-4 text-primary font-semibold">{entry.totalBounty.toFixed(4)} BTC</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center text-text-secondary text-sm">
          <p>Leaderboard data coming soon. API endpoint for reporter statistics will be added.</p>
        </div>
      </div>
    </div>
  )
}

