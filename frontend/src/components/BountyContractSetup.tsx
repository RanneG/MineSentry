import { useState } from 'react'
import { Settings, Plus, X, Info } from 'lucide-react'
import { apiClient } from '@/api/client'
import { toast } from '@/components/ui/Toaster'
import { useWalletStore } from '@/store/walletStore'

interface BountyContractSetupProps {
  onSetupComplete: () => void
}

export default function BountyContractSetup({ onSetupComplete }: BountyContractSetupProps) {
  const { address } = useWalletStore()
  const [signers, setSigners] = useState<string[]>(address ? [address] : ['', ''])
  const [minSignatures, setMinSignatures] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addSigner = () => {
    setSigners([...signers, ''])
  }

  const removeSigner = (index: number) => {
    if (signers.length <= 2) {
      toast.error('At least 2 signers are required')
      return
    }
    setSigners(signers.filter((_, i) => i !== index))
  }

  const updateSigner = (index: number, value: string) => {
    const newSigners = [...signers]
    newSigners[index] = value
    setSigners(newSigners)
    
    // Update min signatures if it exceeds signer count
    if (minSignatures > newSigners.filter(s => s.trim()).length) {
      setMinSignatures(Math.max(2, newSigners.filter(s => s.trim()).length))
    }
  }

  const validateAddress = (address: string): boolean => {
    if (!address || address.trim() === '') return false
    // Basic Bitcoin address validation (starts with 1, 3, or bc1)
    return /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate signers
    const validSigners = signers.filter(s => s.trim() !== '')
    if (validSigners.length < 2) {
      toast.error('At least 2 signers are required')
      return
    }

    // Validate all addresses
    const invalidAddresses = validSigners.filter(addr => !validateAddress(addr))
    if (invalidAddresses.length > 0) {
      toast.error(`Invalid Bitcoin address: ${invalidAddresses[0]}`)
      return
    }

    // Check for duplicates
    const uniqueSigners = new Set(validSigners.map(s => s.trim().toLowerCase()))
    if (uniqueSigners.size !== validSigners.length) {
      toast.error('Duplicate signer addresses are not allowed')
      return
    }

    // Validate min signatures
    if (minSignatures < 1 || minSignatures > validSigners.length) {
      toast.error(`Minimum signatures must be between 1 and ${validSigners.length}`)
      return
    }

    setIsSubmitting(true)

    try {
      await apiClient.setupBountyContract(validSigners.map(s => s.trim()), minSignatures)
      toast.success('Bounty contract initialized successfully!')
      onSetupComplete()
    } catch (error: any) {
      console.error('Setup error:', error)
      const message = error?.response?.data?.detail || error?.message || 'Failed to setup bounty contract'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const useCurrentAddress = (index: number) => {
    if (address) {
      updateSigner(index, address)
    } else {
      toast.info('Please connect your wallet first to use your address')
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-text">Setup Bounty Contract</h2>
          <p className="text-text-secondary text-sm mt-1">
            Configure the bounty contract with authorized signers
          </p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <p className="font-semibold text-text mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Authorized signers can approve bounty payments</li>
              <li>At least 2 signers are required for security</li>
              <li>Minimum signatures determines how many approvals are needed</li>
              <li>Example: 3 signers with 2 min signatures = 2 of 3 must approve</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Authorized Signers */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Authorized Signers <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-text-secondary mb-3">
            Bitcoin addresses that can approve payments (minimum 2 required)
          </p>
          
          <div className="space-y-3">
            {signers.map((signer, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={signer}
                    onChange={(e) => updateSigner(index, e.target.value)}
                    placeholder={`Signer ${index + 1} Bitcoin address`}
                    className="input w-full font-mono text-sm"
                    required
                  />
                  {signer && !validateAddress(signer) && (
                    <p className="text-xs text-red-400 mt-1">
                      Invalid Bitcoin address format
                    </p>
                  )}
                </div>
                {address && signer !== address && (
                  <button
                    type="button"
                    onClick={() => useCurrentAddress(index)}
                    className="btn btn-secondary text-xs whitespace-nowrap"
                    title="Use current wallet address"
                  >
                    Use Mine
                  </button>
                )}
                {signers.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeSigner(index)}
                    className="btn btn-error p-2"
                    title="Remove signer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSigner}
            className="btn btn-secondary mt-3 text-sm"
          >
            <Plus size={16} />
            Add Signer
          </button>
        </div>

        {/* Minimum Signatures */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Minimum Signatures <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-text-secondary mb-3">
            Number of approvals required for a payment (1 to {signers.filter(s => s.trim()).length || 2})
          </p>
          
          <input
            type="number"
            min={1}
            max={signers.filter(s => s.trim()).length || 2}
            value={minSignatures}
            onChange={(e) => setMinSignatures(parseInt(e.target.value) || 2)}
            className="input w-full"
            required
          />
          <p className="text-xs text-text-secondary mt-1">
            Recommended: 2 for better security
          </p>
        </div>

        {/* Validation Summary */}
        {signers.filter(s => s.trim()).length >= 2 && (
          <div className="bg-surface-light border border-border rounded-lg p-4">
            <p className="text-sm font-semibold text-text mb-2">Configuration Summary:</p>
            <div className="text-sm text-text-secondary space-y-1">
              <p>• {signers.filter(s => s.trim()).length} authorized signer(s)</p>
              <p>• {minSignatures} signature(s) required for payments</p>
              <p>• {signers.filter(s => s.trim()).length - minSignatures + 1} signature(s) can be lost before contract is locked</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isSubmitting || signers.filter(s => s.trim()).length < 2}
            className="btn btn-primary flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Setting up...
              </>
            ) : (
              <>
                <Settings size={18} />
                Initialize Bounty Contract
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

