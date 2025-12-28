import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, CheckCircle, Loader2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { toast } from '@/components/ui/Toaster'
import { useWalletStore } from '@/store/walletStore'
import { useDemoMode } from '@/contexts/DemoModeContext'
import { mockBountyContract, getMockBountyPayments } from '@/api/mockApi'
import BountyContractSetup from '@/components/BountyContractSetup'

export default function BountyContract() {
  const queryClient = useQueryClient()
  const { address } = useWalletStore()
  const { isDemoMode } = useDemoMode()

  const { data: contractStatus, isLoading: statusLoading, refetch: refetchContract } = useQuery({
    queryKey: ['bountyContract', isDemoMode],
    queryFn: () => {
      if (isDemoMode) return Promise.resolve(mockBountyContract)
      return apiClient.getBountyContractStatus()
    },
    retry: false, // Don't retry on 404
  })

  const { data: paymentQueue, isLoading: queueLoading } = useQuery({
    queryKey: ['bountyPayments', isDemoMode],
    queryFn: () => {
      if (isDemoMode) {
        return Promise.resolve(getMockBountyPayments())
      }
      return apiClient.getBountyPaymentQueue()
    },
    enabled: !!contractStatus || isDemoMode, // Fetch if contract is configured or in demo mode
  })

  const approveMutation = useMutation({
    mutationFn: ({ paymentId, signerAddress }: { paymentId: string; signerAddress: string }) =>
      apiClient.approveBountyPayment(paymentId, signerAddress),
    onSuccess: () => {
      toast.success('Payment approved')
      queryClient.invalidateQueries({ queryKey: ['bountyPayments'] })
      queryClient.invalidateQueries({ queryKey: ['bountyContract'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const executeMutation = useMutation({
    mutationFn: (paymentId: string) => apiClient.executeBountyPayment(paymentId),
    onSuccess: () => {
      toast.success('Payment executed successfully')
      queryClient.invalidateQueries({ queryKey: ['bountyPayments'] })
      queryClient.invalidateQueries({ queryKey: ['bountyContract'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  if (statusLoading || queueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if contract is not configured (404 error)
  if (!statusLoading && !contractStatus) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Bounty Contract</h1>
          <p className="text-text-secondary mt-1">Configure and manage bounty payments</p>
        </div>
        <BountyContractSetup onSetupComplete={() => {
          refetchContract()
          queryClient.invalidateQueries({ queryKey: ['bountyContract'] })
        }} />
      </div>
    )
  }

  // At this point, contractStatus must be defined (guaranteed by early return above)
  if (!contractStatus) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Bounty Contract</h1>
        <p className="text-text-secondary mt-1">Manage bounty payments and approvals</p>
      </div>

      {/* Contract Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Available Funds</p>
          <p className="text-2xl font-bold text-text">
            {(contractStatus.available_funds_sats / 100000000).toFixed(4)} BTC
          </p>
          <p className="text-text-muted text-xs mt-1">{contractStatus.available_funds_sats.toLocaleString()} sats</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-primary">
            {(contractStatus.total_paid_sats / 100000000).toFixed(4)} BTC
          </p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-text">{contractStatus.pending_payments}</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Contract State</p>
          <p className="text-xl font-semibold text-text capitalize">{contractStatus.state}</p>
        </div>
      </div>

      {/* Payment Queue */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">Payment Queue</h2>
          <span className="status-badge status-pending">{paymentQueue?.length || 0} pending</span>
        </div>

        {!paymentQueue || paymentQueue.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentQueue.map((payment) => (
              <div key={payment.payment_id} className="bg-surface-light p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-sm text-text-secondary">{payment.payment_id.substring(0, 12)}...</span>
                      <span className={`status-badge status-${payment.status}`}>{payment.status}</span>
                      <span className="text-text-secondary text-sm">{payment.approvals} approvals</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Amount</p>
                        <p className="text-text font-semibold">{payment.amount_btc.toFixed(4)} BTC</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Recipient</p>
                        <p className="text-text font-mono text-xs break-all">{payment.recipient_address.substring(0, 12)}...</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Report ID</p>
                        <p className="text-text font-mono text-xs">{payment.report_id.substring(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Created</p>
                        <p className="text-text text-xs">{format(new Date(payment.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {payment.status === 'approved' ? (
                      <button
                        onClick={() => executeMutation.mutate(payment.payment_id)}
                        disabled={executeMutation.isPending}
                        className="btn btn-primary text-sm"
                      >
                        {executeMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Execute Payment
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!address) {
                            toast.error('Please connect your wallet first')
                            return
                          }
                          approveMutation.mutate({ paymentId: payment.payment_id, signerAddress: address })
                        }}
                        disabled={approveMutation.isPending || !address}
                        className="btn btn-secondary text-sm"
                      >
                        {approveMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Approve
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Info */}
      <div className="card bg-surface-light">
        <h3 className="font-semibold text-text mb-3">Contract Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary">Min Signatures</p>
            <p className="text-text font-semibold">{contractStatus.min_signatures}</p>
          </div>
          <div>
            <p className="text-text-secondary">Authorized Signers</p>
            <p className="text-text font-semibold">{contractStatus.authorized_signers.length}</p>
          </div>
          <div>
            <p className="text-text-secondary">Total Payments</p>
            <p className="text-text font-semibold">{contractStatus.total_payments}</p>
          </div>
          <div>
            <p className="text-text-secondary">Contract ID</p>
            <p className="text-text font-mono text-xs">{contractStatus.contract_id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

