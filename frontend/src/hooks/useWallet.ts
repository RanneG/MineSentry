/**
 * useWallet Hook
 * 
 * Custom React hook for managing wallet connection state
 * Provides wallet connection, disconnection, and utility functions
 */

import { useState, useEffect, useCallback } from 'react'
import { useWalletStore } from '@/store/walletStore'
import { connectWallet, disconnectWallet, signMessage, checkInstalledWallets, WALLET_PROVIDERS } from '@/lib/walletProviders'
import { useDemoMode } from '@/contexts/DemoModeContext'

export interface UseWalletReturn {
  // State
  connected: boolean
  address?: string
  provider?: string
  network?: 'mainnet' | 'testnet' | 'signet' | 'regtest'
  
  // Wallet providers
  providers: Array<{
    id: string
    name: string
    installed?: boolean
    downloadUrl?: string
  }>
  
  // Actions
  connect: (providerId: string) => Promise<void>
  disconnect: () => Promise<void>
  signMessage: (message: string) => Promise<string>
  
  // Utilities
  copyAddress: () => Promise<void>
  formatAddress: (length?: number) => string
  
  // Loading states
  isConnecting: boolean
  isDisconnecting: boolean
}

export function useWallet(): UseWalletReturn {
  const walletStore = useWalletStore()
  const { isDemoMode, demoWalletAddress, demoNetwork } = useDemoMode()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [installedWallets, setInstalledWallets] = useState<Record<string, boolean>>({})

  // Check installed wallets on mount and when window changes
  useEffect(() => {
    const checkWallets = () => {
      const installed = checkInstalledWallets()
      setInstalledWallets(installed)
    }

    checkWallets()

    // Re-check when window focus changes (user might install wallet)
    const handleFocus = () => {
      checkWallets()
    }

    window.addEventListener('focus', handleFocus)
    
    // Re-check periodically (in case wallet is installed in another tab)
    const interval = setInterval(checkWallets, 5000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  // Connect to wallet
  const connect = useCallback(async (providerId: string) => {
    // In demo mode, don't allow connecting to real wallets
    if (isDemoMode) {
      // Already connected via demo mode
      return
    }

    try {
      setIsConnecting(true)
      
      const connection = await connectWallet(providerId)
      
      // Update store
      walletStore.connect(providerId, connection.address, connection.network)
      
      // Store connection in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('minesentry_wallet', JSON.stringify({
          provider: providerId,
          address: connection.address,
          network: connection.network,
          timestamp: Date.now(),
        }))
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [walletStore, isDemoMode])

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    // In demo mode, don't allow disconnecting (user should turn off demo mode instead)
    if (isDemoMode && walletStore.provider === 'demo') {
      return
    }

    try {
      setIsDisconnecting(true)
      
      if (walletStore.provider && walletStore.provider !== 'demo') {
        await disconnectWallet(walletStore.provider)
      }
      
      // Clear store
      walletStore.disconnect()
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('minesentry_wallet')
      }
    } catch (error) {
      console.error('Wallet disconnection error:', error)
      throw error
    } finally {
      setIsDisconnecting(false)
    }
  }, [walletStore, isDemoMode])

  // Sign a message
  const sign = useCallback(async (message: string): Promise<string> => {
    if (!walletStore.provider) {
      throw new Error('No wallet connected')
    }

    if (!walletStore.address) {
      throw new Error('No address available')
    }

    try {
      const signature = await signMessage(walletStore.provider, message)
      return signature
    } catch (error) {
      console.error('Message signing error:', error)
      throw error
    }
  }, [walletStore.provider, walletStore.address])

  // Copy address to clipboard
  const copyAddress = useCallback(async (): Promise<void> => {
    const addressToCopy = isDemoMode ? demoWalletAddress : walletStore.address
    if (!addressToCopy) {
      throw new Error('No address to copy')
    }

    try {
      await navigator.clipboard.writeText(addressToCopy)
    } catch (error) {
      console.error('Failed to copy address:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = addressToCopy
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }, [walletStore.address, isDemoMode, demoWalletAddress])

  // Format address for display
  const formatAddress = useCallback((length: number = 8): string => {
    const addressToFormat = isDemoMode ? demoWalletAddress : walletStore.address
    if (!addressToFormat) return ''
    
    if (addressToFormat.length <= length * 2) {
      return addressToFormat
    }
    
    return `${addressToFormat.substring(0, length)}...${addressToFormat.substring(addressToFormat.length - length)}`
  }, [walletStore.address, isDemoMode, demoWalletAddress])

  // Sync demo mode with wallet store
  useEffect(() => {
    const currentProvider = walletStore.provider
    if (isDemoMode) {
      // When demo mode is enabled, simulate a connected wallet
      if (currentProvider !== 'demo') {
        walletStore.connect('demo', demoWalletAddress, demoNetwork)
      }
    } else if (currentProvider === 'demo') {
      // When demo mode is disabled and we're using demo provider, disconnect
      walletStore.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, demoWalletAddress, demoNetwork])

  // Restore wallet connection from localStorage on mount (only if not in demo mode)
  useEffect(() => {
    if (isDemoMode || walletStore.connected) return // Skip if demo mode or already connected
    
    try {
      const stored = localStorage.getItem('minesentry_wallet')
      if (stored) {
        const data = JSON.parse(stored)
        
        // Check if stored connection is recent (within 24 hours)
        const oneDay = 24 * 60 * 60 * 1000
        if (Date.now() - data.timestamp < oneDay) {
          // Restore connection (but don't auto-connect, just restore state)
          // walletStore.connect(data.provider, data.address, data.network)
          // For security, we don't auto-connect, but we could show a "Reconnect" option
        }
      }
    } catch (error) {
      console.error('Failed to restore wallet connection:', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode])

  // Get providers with installation status
  const providers = WALLET_PROVIDERS.map(provider => ({
    ...provider,
    installed: installedWallets[provider.id] ?? false,
  }))

  // Return demo mode values when in demo mode, otherwise return real wallet values
  return {
    // State - use demo values if in demo mode
    connected: isDemoMode ? true : walletStore.connected,
    address: isDemoMode ? demoWalletAddress : walletStore.address,
    provider: isDemoMode ? 'demo' : walletStore.provider,
    network: isDemoMode ? demoNetwork : walletStore.network,
    
    // Providers
    providers,
    
    // Actions
    connect,
    disconnect,
    signMessage: sign,
    
    // Utilities
    copyAddress,
    formatAddress,
    
    // Loading states
    isConnecting: isDemoMode ? false : isConnecting,
    isDisconnecting: isDemoMode ? false : isDisconnecting,
  }
}

