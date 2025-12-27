import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Shield, Loader2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import { useWalletStore } from '@/store/walletStore'
import { toast } from '@/components/ui/Toaster'
import InfoTooltip from '@/components/InfoTooltip'
import type { EvidenceType } from '@/types'

const EVIDENCE_TYPES: { value: EvidenceType; label: string; description: string }[] = [
  { value: 'censorship', label: 'Censorship', description: 'Pool refusing to include valid transactions' },
  { value: 'double_spend_attempt', label: 'Double Spend Attempt', description: 'Attempted double spending detected' },
  { value: 'selfish_mining', label: 'Selfish Mining', description: 'Selfish mining behavior identified' },
  { value: 'block_reordering', label: 'Block Reordering', description: 'Unusual block ordering patterns' },
  { value: 'transaction_censorship', label: 'Transaction Censorship', description: 'Specific transaction censorship' },
  { value: 'unusual_block_template', label: 'Unusual Block Template', description: 'Unusual block template construction' },
  { value: 'other', label: 'Other', description: 'Other suspicious behavior' },
]

export default function SubmitReport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { address: walletAddress, connected } = useWalletStore()

  const [formData, setFormData] = useState({
    reporter_address: walletAddress || '',
    pool_address: '',
    pool_name: '',
    block_height: '',
    evidence_type: 'censorship' as EvidenceType,
    transaction_ids: '',
    block_hash: '',
    description: '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const transactionIds = formData.transaction_ids
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0)

      return apiClient.submitReport({
        reporter_address: data.reporter_address,
        pool_address: data.pool_address,
        pool_name: data.pool_name || undefined,
        block_height: parseInt(data.block_height),
        evidence_type: data.evidence_type,
        transaction_ids: transactionIds.length > 0 ? transactionIds : undefined,
        block_hash: data.block_hash || undefined,
        description: data.description || undefined,
      })
    },
    onSuccess: (data) => {
      toast.success(`Report submitted successfully! ID: ${data.report_id.substring(0, 8)}...`)
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      navigate(`/reports/${data.report_id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">Submit Report</h1>
        <p className="text-text-secondary mt-1">Report suspicious mining pool activity</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reporter Address */}
          <div>
            <label className="label flex items-center gap-1">
              Reporter Address *
              <InfoTooltip text="Your Bitcoin address where the bounty reward will be sent if this report is verified. You can connect your wallet to auto-fill this field." />
            </label>
            <input
              type="text"
              name="reporter_address"
              value={formData.reporter_address}
              onChange={handleChange}
              className="input"
              placeholder="bc1q..."
              required
              disabled={connected && !!walletAddress}
            />
            {connected && walletAddress && (
              <p className="text-text-muted text-xs mt-1">
                Using connected wallet address. Disconnect to use a different address.
              </p>
            )}
            {!connected && (
              <p className="text-text-muted text-xs mt-1">
                Connect your wallet to auto-fill, or enter your Bitcoin address manually.
              </p>
            )}
          </div>

          {/* Pool Address */}
          <div>
            <label className="label flex items-center gap-1">
              Pool Address *
              <InfoTooltip text="The Bitcoin address of the mining pool suspected of engaging in suspicious activity. This is typically the pool's payout or identifier address." />
            </label>
            <input
              type="text"
              name="pool_address"
              value={formData.pool_address}
              onChange={handleChange}
              className="input"
              placeholder="bc1q..."
              required
            />
          </div>

          {/* Pool Name */}
          <div>
            <label className="label flex items-center gap-1">
              Pool Name (Optional)
              <InfoTooltip text="The known name or identifier of the mining pool, if available (e.g., F2Pool, Antpool, Slush Pool)." />
            </label>
            <input
              type="text"
              name="pool_name"
              value={formData.pool_name}
              onChange={handleChange}
              className="input"
              placeholder="e.g., F2Pool, Antpool"
            />
          </div>

          {/* Block Height */}
          <div>
            <label className="label flex items-center gap-1">
              Block Height *
              <InfoTooltip text="The Bitcoin block height where the suspicious activity was detected. This is the sequential number of the block in the blockchain (e.g., 800000)." />
            </label>
            <input
              type="number"
              name="block_height"
              value={formData.block_height}
              onChange={handleChange}
              className="input"
              placeholder="800000"
              required
              min="1"
            />
          </div>

          {/* Evidence Type */}
          <div>
            <label className="label flex items-center gap-1">
              Evidence Type *
              <InfoTooltip text="Select the type of suspicious activity you observed. Different evidence types may have different reward amounts based on severity and impact." />
            </label>
            <select
              name="evidence_type"
              value={formData.evidence_type}
              onChange={handleChange}
              className="input"
              required
            >
              {EVIDENCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction IDs */}
          <div>
            <label className="label flex items-center gap-1">
              Transaction IDs (Optional)
              <InfoTooltip text="Enter the Bitcoin transaction IDs (TXIDs) that serve as evidence. Separate multiple TXIDs with commas. More evidence typically results in higher rewards." />
            </label>
            <textarea
              name="transaction_ids"
              value={formData.transaction_ids}
              onChange={handleChange}
              className="input"
              placeholder="Enter transaction IDs separated by commas"
              rows={3}
            />
            <p className="text-text-muted text-xs mt-1">
              Separate multiple transaction IDs with commas. More evidence = higher reward.
            </p>
          </div>

          {/* Block Hash */}
          <div>
            <label className="label flex items-center gap-1">
              Block Hash (Optional)
              <InfoTooltip text="The cryptographic hash of the Bitcoin block. This uniquely identifies the block and helps verify the report's accuracy." />
            </label>
            <input
              type="text"
              name="block_hash"
              value={formData.block_hash}
              onChange={handleChange}
              className="input font-mono"
              placeholder="000000000000000000..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="label flex items-center gap-1">
              Description (Optional)
              <InfoTooltip text="Provide a detailed description of the suspicious activity you observed. Include context, timing, and any additional information that helps explain the issue." />
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="Describe the suspicious activity..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Submit Report
                </>
              )}
            </button>
            {mutation.isPending && (
              <p className="text-text-secondary text-sm">Validating and submitting report...</p>
            )}
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-500/10 border-blue-500/50">
        <h3 className="font-semibold text-text mb-2">How it works</h3>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>• Reports are automatically validated using blockchain data</li>
          <li>• Validated reports can be verified by authorized signers</li>
          <li>• Verified reports are eligible for Bitcoin rewards</li>
          <li>• Rewards are calculated based on evidence type and quality</li>
        </ul>
      </div>
    </div>
  )
}

