import { create } from 'zustand'
import { WalletState, WalletProvider } from '@/types'

interface WalletStore extends WalletState {
  connect: (provider: string, address: string, network?: 'mainnet' | 'testnet' | 'signet' | 'regtest') => void
  disconnect: () => void
  providers: WalletProvider[]
  checkProviders: () => void
}

export const SUPPORTED_WALLETS: WalletProvider[] = [
  { id: 'hiro', name: 'Hiro Wallet' },
  { id: 'xverse', name: 'Xverse' },
  { id: 'leather', name: 'Leather' },
  { id: 'unisat', name: 'UniSat' },
  { id: 'nostr', name: 'Nostr' },
]

export const useWalletStore = create<WalletStore>((set) => ({
  connected: false,
  address: undefined,
  provider: undefined,
  network: undefined,
  providers: SUPPORTED_WALLETS,

  checkProviders: () => {
    // Check which wallet providers are available
    const providers = SUPPORTED_WALLETS.map((provider) => {
      let installed = false
      
      // Check if wallet is installed (basic checks)
      if (typeof window !== 'undefined') {
        switch (provider.id) {
          case 'hiro':
            installed = !!(window as any).hiro?.wallet
            break
          case 'xverse':
            installed = !!(window as any).XverseProviders
            break
          case 'leather':
            installed = !!(window as any).btc
            break
          case 'unisat':
            installed = !!(window as any).unisat
            break
          case 'nostr':
            installed = !!(window as any).nostr
            break
        }
      }
      
      return { ...provider, installed }
    })
    
    set({ providers })
  },

  connect: (providerId: string, address: string, network?: 'mainnet' | 'testnet' | 'signet' | 'regtest') => {
    set({
      connected: true,
      address,
      provider: providerId,
      network: network || 'mainnet',
    })
  },

  disconnect: () => {
    set({
      connected: false,
      address: undefined,
      provider: undefined,
      network: undefined,
    })
  },
}))

// Initialize provider check on mount
if (typeof window !== 'undefined') {
  useWalletStore.getState().checkProviders()
}

