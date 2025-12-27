import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { toast } from '@/components/ui/Toaster'
import { useState } from 'react'
import InfoTooltip from '@/components/InfoTooltip'

export default function ReportDetail() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => apiClient.getReport(reportId!),
    enabled: !!reportId,
  })

  const validateMutation = useMutation({
    mutationFn: () => apiClient.validateReport(reportId!),
    onSuccess: () => {
      toast.success('Report validated successfully')
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, verifiedBy }: { status: string; verifiedBy?: string }) =>
      apiClient.updateReportStatus(reportId!, status, verifiedBy),
    onSuccess: () => {
      toast.success('Report status updated')
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteReport(reportId!),
    onSuccess: () => {
      toast.success('Report deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      navigate('/reports')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary">Report not found</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'status-badge status-pending',
      verified: 'status-badge status-verified',
      rejected: 'status-badge status-rejected',
      under_review: 'status-badge status-under-review',
    }
    return <span className={classes[status as keyof typeof classes] || classes.pending}>{status}</span>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="btn btn-ghost mb-4">
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">Report Details</h1>
            <p className="text-text-secondary mt-1 font-mono text-sm">{report.report_id}</p>
          </div>
          {getStatusBadge(report.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Block Height
              <InfoTooltip text="The Bitcoin block height where the suspicious activity was detected. This is the sequential number of the block in the blockchain." />
            </h3>
            <p className="text-text font-semibold">{report.block_height.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Evidence Type
              <InfoTooltip text="The type of suspicious activity detected, such as censorship, double-spend attempts, selfish mining, or transaction reordering." />
            </h3>
            <p className="text-text font-semibold capitalize">{report.evidence_type.replace('_', ' ')}</p>
          </div>
          <div>
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Pool Address
              <InfoTooltip text="The Bitcoin address of the mining pool suspected of engaging in the reported activity. This is the pool's payout or identifier address." />
            </h3>
            <p className="text-text font-mono text-sm break-all">{report.pool_address}</p>
          </div>
          {report.pool_name && (
            <div>
              <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
                Pool Name
                <InfoTooltip text="The known name or identifier of the mining pool, if available (e.g., F2Pool, Antpool)." />
              </h3>
              <p className="text-text font-semibold">{report.pool_name}</p>
            </div>
          )}
          <div>
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Reporter Address
              <InfoTooltip text="The Bitcoin address of the person who submitted this report. This address will receive the bounty reward if the report is verified." />
            </h3>
            <p className="text-text font-mono text-sm break-all">{report.reporter_address}</p>
          </div>
          <div>
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Bounty Amount
              <InfoTooltip text="The Bitcoin reward amount (in BTC) that will be paid to the reporter if this report is verified. Amount is calculated based on evidence quality and type." />
            </h3>
            <p className="text-text font-semibold text-primary">
              {(report.bounty_amount / 100000000).toFixed(4)} BTC
            </p>
          </div>
          <div>
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Submitted
              <InfoTooltip text="The date and time when this report was originally submitted to the MineSentry system." />
            </h3>
            <p className="text-text">{format(new Date(report.timestamp), 'PPpp')}</p>
          </div>
          {report.verified_at && (
            <div>
              <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
                Verified At
                <InfoTooltip text="The date and time when this report was verified by authorized signers. Verified reports are eligible for bounty payments." />
              </h3>
              <p className="text-text">{format(new Date(report.verified_at), 'PPpp')}</p>
            </div>
          )}
        </div>

        {report.block_hash && (
          <div className="mt-6">
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Block Hash
              <InfoTooltip text="The cryptographic hash of the Bitcoin block where the suspicious activity occurred. This uniquely identifies the block in the blockchain." />
            </h3>
            <p className="text-text font-mono text-sm break-all bg-surface-light p-3 rounded-lg">
              {report.block_hash}
            </p>
          </div>
        )}

        {report.transaction_ids && report.transaction_ids.length > 0 && (
          <div className="mt-6">
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Transaction IDs
              <InfoTooltip text="The Bitcoin transaction IDs (TXIDs) that serve as evidence for the reported activity. These are the specific transactions that were censored, reordered, or involved in suspicious behavior." />
            </h3>
            <div className="space-y-2">
              {report.transaction_ids.map((txid, index) => (
                <p key={index} className="text-text font-mono text-sm break-all bg-surface-light p-3 rounded-lg">
                  {txid}
                </p>
              ))}
            </div>
          </div>
        )}

        {report.description && (
          <div className="mt-6">
            <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1">
              Description
              <InfoTooltip text="A detailed description of the suspicious activity observed, including context and any additional information provided by the reporter." />
            </h3>
            <p className="text-text bg-surface-light p-4 rounded-lg whitespace-pre-wrap">{report.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => validateMutation.mutate()}
            disabled={validateMutation.isPending}
            className="btn btn-secondary"
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Shield size={18} />
                Validate Report
              </>
            )}
          </button>
          {report.status !== 'verified' && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'verified' })}
              disabled={updateStatusMutation.isPending}
              className="btn btn-primary"
            >
              <CheckCircle size={18} />
              Verify Report
            </button>
          )}
          {report.status !== 'rejected' && (
            <button
              onClick={() => updateStatusMutation.mutate({ status: 'rejected' })}
              disabled={updateStatusMutation.isPending}
              className="btn btn-secondary"
            >
              <XCircle size={18} />
              Reject Report
            </button>
          )}
          {report.status !== 'verified' && (
            <>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-secondary text-red-400 hover:text-red-300 border-red-400/50 hover:border-red-400"
                >
                  <Trash2 size={18} />
                  Delete Report
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-sm">Are you sure?</span>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="btn btn-error text-sm"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Confirm Delete
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteMutation.isPending}
                    className="btn btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {report.status === 'verified' && (
          <p className="text-text-muted text-xs mt-4">
            Verified reports cannot be deleted to maintain audit trail integrity.
          </p>
        )}
      </div>
    </div>
  )
}

