import { useQuery } from '@tanstack/react-query'
import { Trophy, TrendingUp, Award, Target } from 'lucide-react'
import { apiClient } from '@/api/client'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { getMockLeaderboard, getMockBountyHunters } from '@/api/mockApi'
import type { LeaderboardEntry, BountyHunterEntry } from '@/types'

export default function Leaderboard() {
  const { isDemoMode } = useDemoMode()

  const { data: stats } = useQuery({
    queryKey: ['stats', isDemoMode],
    queryFn: () => apiClient.getStats(),
  })

  // Get reporters leaderboard data - use mock data in demo mode
  const { data: reportersData, isLoading: reportersLoading } = useQuery({
    queryKey: ['leaderboard', 'reporters', isDemoMode],
    queryFn: () => {
      if (isDemoMode) return Promise.resolve(getMockLeaderboard())
      return apiClient.getLeaderboard()
    },
  })

  // Get bounty hunters leaderboard data
  const { data: bountyHuntersData, isLoading: bountyHuntersLoading } = useQuery({
    queryKey: ['leaderboard', 'bounty-hunters', isDemoMode],
    queryFn: () => {
      if (isDemoMode) return Promise.resolve(getMockBountyHunters())
      return apiClient.getBountyHuntersLeaderboard()
    },
  })

  const leaderboardData: LeaderboardEntry[] = reportersData || []
  const bountyHuntersDataList: BountyHunterEntry[] = bountyHuntersData || []

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

      {/* Top Reporters Leaderboard */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-text">Top Reporters</h2>
        </div>
        {isDemoMode && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <p className="text-blue-400 text-sm">Demo Mode: Showing mock leaderboard data</p>
          </div>
        )}
        {reportersLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : leaderboardData.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary text-lg mb-2">No reporters yet</p>
            <p className="text-text-muted text-sm">Reporter leaderboard data will appear here once reports are submitted.</p>
          </div>
        )}
      </div>

      {/* Top Bounty Hunters Leaderboard */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-text">Top Bounty Hunters</h2>
        </div>
        {bountyHuntersLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : bountyHuntersDataList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Address</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Claims</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Total Earned</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Largest Bounty</th>
                </tr>
              </thead>
              <tbody>
                {bountyHuntersDataList.map((entry) => (
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
                    <td className="py-4 px-4 text-text">{entry.successful_claims_count}</td>
                    <td className="py-4 px-4 text-primary font-semibold">{entry.total_bounties_earned_btc.toFixed(4)} BTC</td>
                    <td className="py-4 px-4 text-text">{entry.largest_bounty_btc.toFixed(4)} BTC</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary text-lg mb-2">No bounty hunters yet</p>
            <p className="text-text-muted text-sm">Bounty hunters who successfully claim rewards will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

