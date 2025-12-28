import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ExternalLink, Shield, Clock } from 'lucide-react'
import { apiClient } from '@/api/client'
import { format, formatDistanceToNow } from 'date-fns'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { mockBountyContract } from '@/api/mockApi'
import InfoTooltip from '@/components/InfoTooltip'

// Helper function to get block explorer URL
function getBlockExplorerUrl(addressOrTxid: string, network?: string): string {
  const isMainnet = network === 'main' || network === 'Mainnet'
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet'
  
  // If it looks like a transaction ID (64 hex chars), use tx endpoint
  if (/^[a-fA-F0-9]{64}$/.test(addressOrTxid)) {
    return `${baseUrl}/tx/${addressOrTxid}`
  }
  // Otherwise, treat as address
  return `${baseUrl}/address/${addressOrTxid}`
}

export default function BountyContract() {
  const { isDemoMode } = useDemoMode()

  const { data: contractStatus, isLoading } = useQuery({
    queryKey: ['bountyContract', isDemoMode],
    queryFn: () => {
      if (isDemoMode) return Promise.resolve(mockBountyContract)
      return apiClient.getBountyContractStatus()
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!contractStatus) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Bounty Treasury</h1>
          <p className="text-text-secondary mt-1">Public transparency dashboard</p>
        </div>
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-secondary text-lg mb-2">Bounty Contract Not Configured</p>
          <p className="text-text-muted text-sm">
            The bounty contract has not been initialized. Contact the administrator for setup.
          </p>
        </div>
      </div>
    )
  }

  const network = contractStatus.network || 'Unknown'
  const payoutHistory = contractStatus.payout_history || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Bounty Treasury</h1>
        <p className="text-text-secondary mt-1">Public transparency dashboard</p>
      </div>

      {/* Treasury Status */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-text">Treasury Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-text-secondary text-sm mb-2">Contract Address</p>
            <div className="flex items-center gap-2">
              <p className="text-text font-mono text-sm break-all">
                {contractStatus.contract_address || 'Not configured'}
              </p>
              {contractStatus.contract_address && contractStatus.contract_address !== 'Not configured' && (
                <a
                  href={getBlockExplorerUrl(contractStatus.contract_address, contractStatus.network_type)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover flex-shrink-0"
                  title="View on block explorer"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-2">Current Balance</p>
            <p className="text-2xl font-bold text-primary">
              {contractStatus.balance_btc?.toFixed(4) || (contractStatus.available_funds_sats / 100000000).toFixed(4)} BTC
            </p>
            <p className="text-text-muted text-xs mt-1">
              {contractStatus.balance_sats?.toLocaleString() || contractStatus.available_funds_sats.toLocaleString()} sats
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Clock size={12} className="text-text-muted" />
              <p className="text-text-muted text-xs">
                Updated {formatDistanceToNow(new Date(contractStatus.updated_at || contractStatus.created_at || new Date().toISOString()), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-2">Network</p>
            <p className="text-text font-semibold text-lg">{network}</p>
          </div>
        </div>
      </div>

      {/* Governance Rules */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-text">Governance Rules</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-text-secondary text-sm mb-2">Required Signatures</p>
            <p className="text-text font-semibold text-lg">
              {contractStatus.signature_threshold || `${contractStatus.min_signatures} of ${contractStatus.authorized_signers.length}`}
            </p>
            <p className="text-text-muted text-xs mt-1">
              At least {contractStatus.min_signatures} of {contractStatus.authorized_signers.length} authorized signers must approve payments
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-3">Authorized Signers</p>
            <div className="space-y-2">
              {contractStatus.authorized_signers.map((signer, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-surface-light rounded-lg">
                  <span className="text-text-secondary text-sm w-6">{index + 1}.</span>
                  <span className="text-text font-mono text-sm flex-1 break-all">{signer}</span>
                  <a
                    href={getBlockExplorerUrl(signer, contractStatus.network_type)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover flex-shrink-0"
                    title="View on block explorer"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Proof of Performance */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text">Proof of Performance</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-text-secondary text-sm mb-1">Total Bounties Paid</p>
            <p className="text-2xl font-bold text-text">{contractStatus.total_payments}</p>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-1">Total BTC Distributed</p>
            <p className="text-2xl font-bold text-primary">
              {(contractStatus.total_paid_sats / 100000000).toFixed(4)} BTC
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-text-secondary text-sm">Pending Payments</p>
              <InfoTooltip text="Reports that have been validated by the community and are now waiting for the required signatures from authorized signers to be paid out." />
            </div>
            <p className="text-2xl font-bold text-text">{contractStatus.pending_payments}</p>
          </div>
        </div>

        {/* Payout History */}
        <div>
          <h3 className="text-lg font-semibold text-text mb-4">Recent Payout History</h3>
          {payoutHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Report ID</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Recipient</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map((payout, index) => (
                    <tr key={index} className="border-b border-border hover:bg-surface-light transition-colors">
                      <td className="py-3 px-4 text-text text-sm">
                        {format(new Date(payout.date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-text font-mono text-sm">{payout.report_id.substring(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-text font-mono text-xs">
                            {payout.recipient.substring(0, 12)}...{payout.recipient.substring(payout.recipient.length - 8)}
                          </span>
                          <a
                            href={getBlockExplorerUrl(payout.recipient, contractStatus.network_type)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover"
                            title="View address on block explorer"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-primary font-semibold">
                        {payout.amount_btc.toFixed(4)} BTC
                      </td>
                      <td className="py-3 px-4">
                        {payout.txid ? (
                          <div className="flex items-center gap-2">
                            <span className="text-text font-mono text-xs">
                              {payout.txid.substring(0, 12)}...{payout.txid.substring(payout.txid.length - 8)}
                            </span>
                            <a
                              href={getBlockExplorerUrl(payout.txid, contractStatus.network_type)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-hover"
                              title="View transaction on block explorer"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout history yet</p>
              <p className="text-text-muted text-sm mt-1">Completed bounty payments will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
