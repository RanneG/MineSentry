import { useQuery } from '@tanstack/react-query'
import { Activity, Database, Shield, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { apiClient } from '@/api/client'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { mockSystemStatus } from '@/api/mockApi'

export default function SystemStatus() {
  const { isDemoMode } = useDemoMode()
  
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['systemStatus', isDemoMode],
    queryFn: () => {
      if (isDemoMode) return Promise.resolve(mockSystemStatus)
      return apiClient.getSystemStatus()
    },
    refetchInterval: isDemoMode ? false : 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Unable to fetch system status</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">System Status</h1>
          <p className="text-text-secondary mt-1">Real-time system health monitoring</p>
        </div>
        <button onClick={() => refetch()} className="btn btn-secondary">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Overall Status */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text mb-4">Overall Status</h2>
        <div className="flex items-center gap-4">
          {status.bitcoin_rpc?.connected && status.database?.connected ? (
            <>
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text font-semibold text-lg">All Systems Operational</p>
                <p className="text-text-secondary text-sm">All components are running normally</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-text font-semibold text-lg">System Degraded</p>
                <p className="text-text-secondary text-sm">Some components are not responding</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bitcoin RPC */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className={`w-6 h-6 ${status.bitcoin_rpc?.connected ? 'text-green-400' : 'text-red-400'}`} />
              <h3 className="text-lg font-semibold text-text">Bitcoin Node</h3>
            </div>
            {status.bitcoin_rpc?.connected ? (
              <span className="status-badge status-verified">Connected</span>
            ) : (
              <span className="status-badge status-rejected">Disconnected</span>
            )}
          </div>
          {status.bitcoin_rpc?.connected ? (
            <div className="space-y-2">
              {status.bitcoin_rpc.chain && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Network</span>
                  <span className="text-text font-semibold capitalize">{status.bitcoin_rpc.chain}</span>
                </div>
              )}
              {status.bitcoin_rpc.block_height !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Block Height</span>
                  <span className="text-text font-semibold">{status.bitcoin_rpc.block_height.toLocaleString()}</span>
                </div>
              )}
              {status.bitcoin_rpc.difficulty && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Difficulty</span>
                  <span className="text-text font-semibold font-mono text-sm">
                    {status.bitcoin_rpc.difficulty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
              {status.bitcoin_rpc.verification_progress !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Sync Progress</span>
                  <span className="text-text font-semibold">
                    {(status.bitcoin_rpc.verification_progress * 100).toFixed(2)}%
                  </span>
                </div>
              )}
              {status.bitcoin_rpc.connections !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Connections</span>
                  <span className="text-text font-semibold">{status.bitcoin_rpc.connections}</span>
                </div>
              )}
              {status.bitcoin_rpc.size_on_disk && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Size on Disk</span>
                  <span className="text-text font-semibold">
                    {(status.bitcoin_rpc.size_on_disk / (1024**3)).toFixed(2)} GB
                  </span>
                </div>
              )}
              {status.bitcoin_rpc.pruned !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pruned</span>
                  <span className="text-text font-semibold">{status.bitcoin_rpc.pruned ? 'Yes' : 'No'}</span>
                </div>
              )}
              {status.bitcoin_rpc.initial_block_download && (
                <div className="flex justify-between">
                  <span className="text-text-secondary text-yellow-400">Initial Block Download</span>
                  <span className="text-text font-semibold text-yellow-400">In Progress</span>
                </div>
              )}
              {status.bitcoin_rpc.rpc_url && (
                <div className="flex justify-between items-start mt-3 pt-3 border-t border-border">
                  <span className="text-text-secondary text-xs">RPC URL</span>
                  <span className="text-text font-mono text-xs break-all text-right ml-4">
                    {status.bitcoin_rpc.rpc_url}
                  </span>
                </div>
              )}
              {status.bitcoin_rpc.best_block_hash && (
                <div className="flex justify-between items-start mt-2">
                  <span className="text-text-secondary text-xs">Best Block Hash</span>
                  <span className="text-text font-mono text-xs break-all text-right ml-4">
                    {status.bitcoin_rpc.best_block_hash.substring(0, 16)}...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-text-secondary text-sm">
              {status.bitcoin_rpc?.error ? (
                <p>Error: {status.bitcoin_rpc.error}</p>
              ) : (
                <p>Bitcoin node is not connected. Check your RPC configuration.</p>
              )}
              {status.bitcoin_rpc?.rpc_url && (
                <p className="text-xs mt-2 font-mono">RPC URL: {status.bitcoin_rpc.rpc_url}</p>
              )}
            </div>
          )}
        </div>

        {/* Database */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className={`w-6 h-6 ${status.database?.connected ? 'text-green-400' : 'text-red-400'}`} />
              <h3 className="text-lg font-semibold text-text">Database</h3>
            </div>
            {status.database?.connected ? (
              <span className="status-badge status-verified">Connected</span>
            ) : (
              <span className="status-badge status-rejected">Disconnected</span>
            )}
          </div>
          {status.database?.connected && (
            <div className="space-y-2">
              {status.database.total_reports !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Reports</span>
                  <span className="text-text font-semibold">{status.database.total_reports}</span>
                </div>
              )}
              {status.database.verified_reports !== undefined && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Verified</span>
                  <span className="text-text font-semibold">{status.database.verified_reports}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spells */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-text">Spells</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Censorship Detection</span>
              <span className={status.spells?.censorship_detection ? 'text-green-400' : 'text-red-400'}>
                {status.spells?.censorship_detection ? '✓ Available' : '✗ Unavailable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Bounty Contract</span>
              <span className={status.spells?.bounty_contract ? 'text-green-400' : 'text-text-muted'}>
                {status.spells?.bounty_contract ? '✓ Available' : '— Not Configured'}
              </span>
            </div>
          </div>
        </div>

        {/* Bounty Contract Status */}
        {status.bounty_contract && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-text">Bounty Contract</h3>
              </div>
              <span className={`status-badge status-${status.bounty_contract.state}`}>
                {status.bounty_contract.state}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Available Funds</span>
                <span className="text-text font-semibold">
                  {(status.bounty_contract.available_funds_sats / 100000000).toFixed(4)} BTC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Pending Payments</span>
                <span className="text-text font-semibold">{status.bounty_contract.pending_payments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Paid</span>
                <span className="text-text font-semibold">
                  {(status.bounty_contract.total_paid_sats / 100000000).toFixed(4)} BTC
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
