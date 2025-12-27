import { useState } from 'react'
import { Wallet, LogOut, ChevronDown, Copy, Check, QrCode, ExternalLink } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from '@/components/ui/Toaster'

export default function WalletConnect() {
  const { 
    connected, 
    address, 
    provider, 
    network,
    providers,
    connect, 
    disconnect,
    copyAddress,
    formatAddress,
    isConnecting,
  } = useWallet()

  const [showDropdown, setShowDropdown] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleConnect = async (providerId: string) => {
    try {
      await connect(providerId)
      setShowDropdown(false)
      toast.success('Wallet connected successfully!')
    } catch (error) {
      console.error('Connection error:', error)
      const message = error instanceof Error ? error.message : 'Failed to connect wallet'
      toast.error(message)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setShowDropdown(false)
      toast.success('Wallet disconnected')
    } catch (error) {
      console.error('Disconnection error:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  const handleCopyAddress = async () => {
    try {
      await copyAddress()
      setCopied(true)
      toast.success('Address copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy address')
    }
  }

  const getProviderName = (providerId?: string) => {
    const provider = providers.find(p => p.id === providerId)
    return provider?.name || providerId || 'Unknown'
  }

  const getNetworkBadgeColor = (network?: string) => {
    switch (network) {
      case 'mainnet':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'testnet':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'signet':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Connected state - show address and options
  if (connected && address) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Wallet size={18} />
          <span className="hidden sm:inline font-mono">
            {formatAddress(6)}
          </span>
          {network && (
            <span className={`hidden md:inline px-2 py-0.5 rounded text-xs border ${getNetworkBadgeColor(network)}`}>
              {network}
            </span>
          )}
          <ChevronDown size={16} />
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => {
                setShowDropdown(false)
                setShowQRCode(false)
              }}
            />
            <div className="absolute right-0 mt-2 w-80 origin-top-right bg-surface border border-border rounded-lg shadow-lg z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-text">Connected Wallet</p>
                  <span className={`px-2 py-1 rounded text-xs border ${getNetworkBadgeColor(network)}`}>
                    {network || 'unknown'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mb-1">{getProviderName(provider)}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-text break-all">{address}</p>
                  <button
                    onClick={handleCopyAddress}
                    className="flex-shrink-0 p-1.5 hover:bg-surface-light rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-text-secondary" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowQRCode(!showQRCode)
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text flex items-center gap-3 hover:bg-surface-light transition-colors"
                >
                  <QrCode size={16} className="text-text-secondary" />
                  <span>{showQRCode ? 'Hide' : 'Show'} QR Code</span>
                </button>

                {/* QR Code Display */}
                {showQRCode && address && (
                  <div className="px-4 py-3 border-t border-border bg-surface-light/50">
                    <div className="flex justify-center bg-white p-4 rounded-lg">
                      <QRCodeSVG 
                        value={address}
                        size={200}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-text-secondary text-center mt-2">
                      Scan to receive Bitcoin
                    </p>
                  </div>
                )}

                <button
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 flex items-center gap-3 hover:bg-surface-light transition-colors"
                >
                  <LogOut size={16} />
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Not connected - show connect button
  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn btn-primary flex items-center gap-2" 
        disabled={isConnecting}
      >
        <Wallet size={18} />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-72 origin-top-right bg-surface border border-border rounded-lg shadow-lg z-50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-text">Select Wallet</p>
              <p className="text-xs text-text-secondary mt-1">
                Connect your Bitcoin wallet to continue
              </p>
            </div>

            {/* Wallet List */}
            <div className="py-2 max-h-96 overflow-y-auto">
              {providers.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    if (wallet.installed) {
                      handleConnect(wallet.id)
                    } else if (wallet.downloadUrl) {
                      window.open(wallet.downloadUrl, '_blank')
                      setShowDropdown(false)
                    }
                  }}
                  disabled={wallet.installed === false && !wallet.downloadUrl}
                  className={`w-full text-left px-4 py-3 text-sm text-text flex items-center justify-between hover:bg-surface-light transition-colors ${
                    wallet.installed === false && !wallet.downloadUrl 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                      <Wallet size={16} className="text-text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">{wallet.name}</p>
                      {wallet.installed === false && (
                        <p className="text-xs text-text-muted">Not installed</p>
                      )}
                    </div>
                  </div>
                  {wallet.installed === false && wallet.downloadUrl && (
                    <ExternalLink size={14} className="text-text-secondary" />
                  )}
                  {wallet.installed && (
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border bg-surface-light/50">
              <p className="text-xs text-text-secondary text-center">
                Need a wallet?{' '}
                <a 
                  href="https://bitcoin.org/en/wallets" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
