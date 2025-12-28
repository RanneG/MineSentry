import { useState } from 'react'
import { X, CheckCircle, XCircle, Bitcoin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { toast } from './ui/Toaster'
import { useWalletStore } from '@/store/walletStore'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import InfoTooltip from './InfoTooltip'
import type { MiningPoolReport } from '@/types'

interface ValidateReportModalProps {
  report: MiningPoolReport
  isOpen: boolean
  onClose: () => void
  onVoteSubmitted: (vote: 'confirm' | 'reject', stakeAmount: number) => Promise<void>
}

export default function ValidateReportModal({
  report,
  isOpen,
  onClose,
  onVoteSubmitted,
}: ValidateReportModalProps) {
  const { connected } = useWalletStore()
  const { isDemoMode } = useDemoMode()
  const [vote, setVote] = useState<'confirm' | 'reject' | null>(null)
  const [stakeAmount, setStakeAmount] = useState<string>('10000')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evidenceExpanded, setEvidenceExpanded] = useState(false)
  const [reportDetailsExpanded, setReportDetailsExpanded] = useState(false)

  // In demo mode, consider wallet as connected
  const effectiveConnected = isDemoMode || connected

  // Fetch detection results (confidence score and evidence)
  const { data: detectionResults, isLoading: detectionLoading } = useQuery({
    queryKey: ['report-confidence', report.report_id],
    queryFn: () => apiClient.getReportConfidence(report.report_id),
    enabled: isOpen, // Only fetch when modal is open
    retry: 1,
  })

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!vote) {
      toast.error('Please select a vote (Confirm or Reject)')
      return
    }

    if (!effectiveConnected) {
      toast.error('Please connect your wallet to vote')
      return
    }

    const stake = parseInt(stakeAmount)
    if (isNaN(stake) || stake < 10000) {
      toast.error('Minimum stake is 10,000 sats')
      return
    }

    setIsSubmitting(true)

    try {
      await onVoteSubmitted(vote, stake)
      // Close modal after successful submission
      onClose()
      setVote(null)
      setStakeAmount('10000')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit vote')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setVote(null)
      setStakeAmount('10000')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg max-w-2xl w-full flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <h2 className="text-2xl font-bold text-text">Validate Report</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-text-muted hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

        {/* Report Info - Collapsible */}
        <div>
          <button
            onClick={() => setReportDetailsExpanded(!reportDetailsExpanded)}
            className="w-full flex items-center justify-between p-3 bg-surface-light rounded-lg hover:bg-surface-light/80 transition-colors"
          >
            <h3 className="text-text font-semibold">Report Details</h3>
            {reportDetailsExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            )}
          </button>

          {reportDetailsExpanded && (
            <div className="mt-3 bg-surface-light p-4 rounded-lg space-y-3">
              <div>
                <p className="text-text-secondary text-xs mb-1">Report ID</p>
                <p className="text-text font-mono text-sm">{report.report_id}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Pool Address</p>
                <p className="text-text font-mono text-sm break-all">{report.pool_address}</p>
                {report.pool_name && (
                  <p className="text-text text-sm mt-1">({report.pool_name})</p>
                )}
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Block Height</p>
                <p className="text-text font-semibold">{report.block_height.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Evidence Type</p>
                <p className="text-text font-semibold capitalize">{report.evidence_type.replace(/_/g, ' ')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Evidence Section - Collapsible */}
        <div>
          <button
            onClick={() => setEvidenceExpanded(!evidenceExpanded)}
            className="w-full flex items-center justify-between p-3 bg-surface-light rounded-lg hover:bg-surface-light/80 transition-colors"
          >
            <h3 className="text-text font-semibold">Evidence to Review</h3>
            {evidenceExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            )}
          </button>

          {evidenceExpanded && (
            <div className="mt-3 space-y-3">
              {/* Detection Results / Confidence Score */}
              {detectionLoading ? (
                <div className="bg-surface-light p-4 rounded-lg text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-text-secondary text-sm">Loading detection results...</p>
                </div>
              ) : detectionResults ? (
                <div className="bg-surface-light p-3 rounded-lg space-y-3">
                  {!(detectionResults as any).error && (
                    <div className="flex items-center justify-between">
                      <p className="text-text-secondary text-xs">Detection Confidence</p>
                      <p className={`text-lg font-bold ${
                        detectionResults.confidence_score >= 0.7 ? 'text-green-400' :
                        detectionResults.confidence_score >= 0.4 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {(detectionResults.confidence_score * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                  
                  {!(detectionResults as any).error && detectionResults.detection_methods && detectionResults.detection_methods.length > 0 && (
                    <div>
                      <p className="text-text-secondary text-xs mb-2">
                        Detection Methods Triggered ({detectionResults.detection_methods.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {detectionResults.detection_methods.map((method, index) => (
                          <span key={index} className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                            {method.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!(detectionResults as any).error && detectionResults.missing_transactions && detectionResults.missing_transactions.length > 0 && (
                    <div>
                      <p className="text-text-secondary text-xs mb-2">
                        Missing Transactions ({detectionResults.missing_transactions.length})
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {detectionResults.missing_transactions.map((txid, index) => (
                          <p key={index} className="text-text font-mono text-xs break-all bg-surface p-2 rounded">
                            {txid}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {detectionResults.message && (
                    <div className={`pt-2 border-t border-border ${
                      (detectionResults as any).error 
                        ? 'bg-yellow-500/10 border-yellow-500/30 p-3 rounded-lg -mx-3 -mb-3' 
                        : ''
                    }`}>
                      <p className="text-text-secondary text-xs mb-1">Detection Summary</p>
                      <p className={`text-sm ${
                        (detectionResults as any).error 
                          ? 'text-yellow-400' 
                          : 'text-text'
                      }`}>
                        {detectionResults.message}
                      </p>
                      {(detectionResults as any).error && (detectionResults as any).error_type === 'rpc_connection' && (
                        <div className="mt-2 text-xs text-text-muted">
                          <p className="mb-1">💡 <strong>To enable detection:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Start Bitcoin Core testnet: <code className="bg-surface px-1 py-0.5 rounded">./start_bitcoind_testnet.sh</code></li>
                            <li>Or use Demo Mode (toggle button) to test without Bitcoin Core</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Block Hash */}
              {report.block_hash && (
                <div className="bg-surface-light p-3 rounded-lg">
                  <p className="text-text-secondary text-xs mb-1">Block Hash</p>
                  <p className="text-text font-mono text-sm break-all">{report.block_hash}</p>
                </div>
              )}

              {/* Transaction IDs */}
              {report.transaction_ids && report.transaction_ids.length > 0 && (
                <div className="bg-surface-light p-3 rounded-lg">
                  <p className="text-text-secondary text-xs mb-2">
                    Reported Transaction IDs ({report.transaction_ids.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {report.transaction_ids.map((txid, index) => (
                      <p key={index} className="text-text font-mono text-xs break-all bg-surface p-2 rounded">
                        {txid}
                      </p>
                    ))}
                  </div>
                  <p className="text-text-muted text-xs mt-2">
                    These transactions were reported as {report.evidence_type.replace(/_/g, ' ')} evidence.
                  </p>
                </div>
              )}

              {/* Description */}
              {report.description && (
                <div className="bg-surface-light p-3 rounded-lg">
                  <p className="text-text-secondary text-xs mb-2">Description</p>
                  <p className="text-text text-sm whitespace-pre-wrap leading-relaxed">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Evidence Summary - Show if no detection results AND no basic evidence */}
              {!detectionResults && !report.block_hash && !report.transaction_ids?.length && !report.description && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ No detailed evidence provided. Only basic report information available.
                  </p>
                </div>
              )}

              {/* Bounty Amount */}
              <div className="bg-primary/10 border border-primary/30 p-3 rounded-lg">
                <p className="text-text-secondary text-xs mb-1">Bounty Amount</p>
                <p className="text-primary font-semibold text-lg">
                  {(report.bounty_amount / 100000000).toFixed(4)} BTC
                </p>
                <p className="text-text-muted text-xs mt-1">
                  This bounty will be paid to the reporter if the report is verified.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-border pt-4">
          <p className="text-text-secondary text-xs mb-4">
            {evidenceExpanded 
              ? 'Review the evidence above, then cast your vote below.'
              : 'Click "Evidence to Review" to see detailed evidence before voting.'}
          </p>
        </div>

        {/* Vote Selection */}
        <div>
          <p className="text-text font-semibold mb-3">Your Vote</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setVote('confirm')}
              disabled={isSubmitting}
              className={`p-4 rounded-lg border-2 transition-all ${
                vote === 'confirm'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-border hover:border-green-500/50'
              }`}
            >
              <CheckCircle
                className={`w-8 h-8 mx-auto mb-2 ${
                  vote === 'confirm' ? 'text-green-400' : 'text-text-muted'
                }`}
              />
              <p className={`font-semibold ${vote === 'confirm' ? 'text-green-400' : 'text-text'}`}>
                Confirm
              </p>
              <p className="text-text-secondary text-xs mt-1">Evidence is valid</p>
            </button>

            <button
              onClick={() => setVote('reject')}
              disabled={isSubmitting}
              className={`p-4 rounded-lg border-2 transition-all ${
                vote === 'reject'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-border hover:border-red-500/50'
              }`}
            >
              <XCircle
                className={`w-8 h-8 mx-auto mb-2 ${
                  vote === 'reject' ? 'text-red-400' : 'text-text-muted'
                }`}
              />
              <p className={`font-semibold ${vote === 'reject' ? 'text-red-400' : 'text-text'}`}>
                Reject
              </p>
              <p className="text-text-secondary text-xs mt-1">Evidence is invalid</p>
            </button>
          </div>
        </div>

        {/* Stake Amount */}
        <div>
          <label className="label flex items-center gap-2">
            <Bitcoin className="w-4 h-4" />
            Stake Amount (sats)
            <InfoTooltip text="The amount of Bitcoin (in satoshis) you're staking with your vote. Your stake is locked until the report is resolved. If you vote correctly, you may receive rewards. If you vote incorrectly, you risk losing your stake. Minimum stake is 10,000 sats." />
          </label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            disabled={isSubmitting}
            className="input"
            placeholder="10000"
            min="10000"
            step="1000"
          />
          <p className="text-text-muted text-xs mt-1">
            Minimum: 10,000 sats. Your stake will be locked until the report is resolved.
          </p>
        </div>

        {/* Wallet Connection Warning */}
        {!effectiveConnected && !isDemoMode && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Please connect your wallet to submit a vote and stake Bitcoin.
            </p>
          </div>
        )}

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-lg">
            <p className="text-blue-400 text-sm">
              Demo Mode: Your vote will be simulated and not actually submitted.
            </p>
          </div>
        )}

        </div>

        {/* Footer - Fixed */}
        <div className="p-6 pt-4 border-t border-border">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !vote || !effectiveConnected}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
