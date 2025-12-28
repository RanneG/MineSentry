import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Activity, FileText, Shield, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import StatsCard from '@/components/StatsCard'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { mockSystemStats, mockSystemStatus } from '@/api/mockApi'

export default function Dashboard() {
  const { isDemoMode } = useDemoMode()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', isDemoMode],
    queryFn: () => {
      if (isDemoMode) return Promise.resolve(mockSystemStats)
      return apiClient.getStats()
    },
    refetchInterval: isDemoMode ? false : 30000,
  })

  const { data: systemStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['systemStatus', isDemoMode],
    queryFn: () => {
      if (isDemoMode) return Promise.resolve(mockSystemStatus)
      return apiClient.getSystemStatus()
    },
    refetchInterval: isDemoMode ? false : 30000,
  })

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', 'recent'],
    queryFn: () => {
      // Use real reports from API for both demo and non-demo modes
      return apiClient.getReports({ limit: 5 })
    },
  })

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'status-badge status-pending',
      verified: 'status-badge status-verified',
      rejected: 'status-badge status-rejected',
      under_review: 'status-badge status-under-review',
    }
    return <span className={classes[status as keyof typeof classes] || classes.pending}>{status}</span>
  }

  if (statsLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Dashboard</h1>
          <p className="text-text-secondary mt-1">Monitor mining pool activity and reports</p>
        </div>
        <Link to="/submit" className="btn btn-primary">
          <Shield size={18} />
          Submit Report
        </Link>
      </div>

      {/* System Status */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Bitcoin RPC</p>
                <p className="text-xl font-semibold text-text mt-1">
                  {systemStatus.bitcoin_rpc?.connected ? '✓ Connected' : '✗ Disconnected'}
                </p>
                {systemStatus.bitcoin_rpc?.block_height && (
                  <p className="text-text-muted text-xs mt-1">
                    Block: {systemStatus.bitcoin_rpc.block_height.toLocaleString()}
                  </p>
                )}
              </div>
              <Activity className={`w-8 h-8 ${systemStatus.bitcoin_rpc?.connected ? 'text-green-400' : 'text-red-400'}`} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Database</p>
                <p className="text-xl font-semibold text-text mt-1">
                  {systemStatus.database?.connected ? '✓ Connected' : '✗ Disconnected'}
                </p>
              </div>
              <FileText className={`w-8 h-8 ${systemStatus.database?.connected ? 'text-green-400' : 'text-red-400'}`} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Bounty Contract</p>
                <p className="text-xl font-semibold text-text mt-1">
                  {systemStatus.bounty_contract ? '✓ Active' : '— Not Configured'}
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${systemStatus.bounty_contract ? 'text-green-400' : 'text-text-muted'}`} />
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Reports"
            value={stats.total_reports || 0}
            icon={FileText}
            change={stats.pending_reports ? `${stats.pending_reports} pending` : undefined}
          />
          <StatsCard
            title="Verified"
            value={stats.verified_reports || 0}
            icon={Shield}
            iconColor="text-green-400"
          />
          <StatsCard
            title="Pending"
            value={stats.pending_reports || 0}
            icon={Activity}
            iconColor="text-yellow-400"
          />
          <StatsCard
            title="BTC Paid"
            value={`${(stats.total_bounty_paid_btc || 0).toFixed(4)}`}
            icon={TrendingUp}
            iconColor="text-primary"
          />
        </div>
      )}

      {/* Recent Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">Recent Reports</h2>
          <Link to="/reports" className="btn btn-ghost text-sm">
            View All
            <RefreshCw size={16} />
          </Link>
        </div>

        {reportsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reports yet.</p>
            <Link to="/submit" className="text-primary hover:underline mt-2 inline-block">
              Submit your first report
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Block</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Bounty</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.report_id} className="border-b border-border hover:bg-surface-light transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/reports/${report.report_id}`}
                        className="text-primary hover:underline font-mono text-sm"
                      >
                        {report.report_id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-text">{report.block_height.toLocaleString()}</td>
                    <td className="py-3 px-4 text-text-secondary">{report.evidence_type}</td>
                    <td className="py-3 px-4">{getStatusBadge(report.status)}</td>
                    <td className="py-3 px-4 text-text">
                      {(report.bounty_amount / 100000000).toFixed(4)} BTC
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-sm">
                      {format(new Date(report.timestamp), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text mb-4">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/submit" className="btn btn-primary">
            <Shield size={18} />
            Submit New Report
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            <FileText size={18} />
            View All Reports
          </Link>
          <Link to="/bounty" className="btn btn-secondary">
            <TrendingUp size={18} />
            Bounty Contract
          </Link>
        </div>
      </div>
    </div>
  )
}
