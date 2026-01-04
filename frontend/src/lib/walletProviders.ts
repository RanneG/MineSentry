/**
 * Bitcoin Wallet Providers Configuration
 * 
 * Supports multiple Bitcoin wallet providers:
 * - Hiro Wallet (Stacks/Bitcoin)
 * - Xverse (Bitcoin/Stacks)
 * - Leather (formerly Hiro)
 * - UniSat (Bitcoin Ordinals)
 * - Nostr (Bitcoin payments)
 */

export interface WalletProvider {
  id: string
  name: string
  icon?: string
  installed?: boolean
  downloadUrl?: string
}

export interface WalletConnection {
  address: string
  network: 'mainnet' | 'testnet' | 'signet' | 'regtest'
  publicKey?: string
  provider: string
}

export interface WalletProviderInterface {
  id: string
  name: string
  checkInstalled: () => boolean
  connect: () => Promise<WalletConnection>
  disconnect: () => Promise<void>
  getAddress: () => Promise<string>
  getNetwork: () => Promise<'mainnet' | 'testnet' | 'signet' | 'regtest'>
  signMessage: (message: string) => Promise<string>
  sendTransaction?: (to: string, amount: number) => Promise<string>
}

/**
 * Check if Hiro Wallet is installed
 */
function checkHiroInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).hiro?.wallet || !!(window as any).StacksProvider
}

/**
 * Connect to Hiro Wallet
 */
async function connectHiro(): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available')
  }

  const hiro = (window as any).hiro?.wallet || (window as any).StacksProvider

  if (!hiro) {
    throw new Error('Hiro Wallet is not installed')
  }

  try {
    // Request authentication
    const result = await hiro.request('getAddresses')
    
    if (!result || !result.addresses || result.addresses.length === 0) {
      throw new Error('No addresses found in Hiro Wallet')
    }

    const address = result.addresses[0]
    
    // Get network info
    const networkInfo = await hiro.request('getNetwork')
    const network = networkInfo?.network || 'mainnet'

    return {
      address,
      network: network as 'mainnet' | 'testnet',
      provider: 'hiro',
    }
  } catch (error) {
    throw new Error(`Failed to connect to Hiro Wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if Xverse is installed
 */
function checkXverseInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).XverseProviders?.BitcoinProvider
}

/**
 * Connect to Xverse
 */
async function connectXverse(): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available')
  }

  const XverseProviders = (window as any).XverseProviders

  if (!XverseProviders?.BitcoinProvider) {
    throw new Error('Xverse is not installed')
  }

  try {
    const provider = new XverseProviders.BitcoinProvider('MineSentry')
    
    // Request account
    const accounts = await provider.requestAccounts()
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in Xverse')
    }

    const address = accounts[0]
    
    // Get network
    const networkInfo = await provider.getNetwork()
    const network = networkInfo?.network || 'mainnet'

    return {
      address,
      network: network as 'mainnet' | 'testnet',
      provider: 'xverse',
    }
  } catch (error) {
    throw new Error(`Failed to connect to Xverse: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if Leather is installed
 */
function checkLeatherInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).btc || !!(window as any).LeatherProvider
}

/**
 * Connect to Leather Wallet
 */
async function connectLeather(): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available')
  }

  const btc = (window as any).btc || (window as any).LeatherProvider

  if (!btc) {
    throw new Error('Leather Wallet is not installed')
  }

  try {
    // Request account
    const accounts = await btc.request('requestAccounts', [{ purposes: ['payment', 'ordinals'] }])
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in Leather Wallet')
    }

    const address = accounts[0].address
    const network = accounts[0].network || 'mainnet'

    return {
      address,
      network: network as 'mainnet' | 'testnet',
      provider: 'leather',
    }
  } catch (error) {
    throw new Error(`Failed to connect to Leather Wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if UniSat is installed
 */
function checkUniSatInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).unisat
}

/**
 * Connect to UniSat Wallet
 */
async function connectUniSat(): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available')
  }

  const unisat = (window as any).unisat

  if (!unisat) {
    throw new Error('UniSat Wallet is not installed')
  }

  try {
    // Request account
    const accounts = await unisat.requestAccounts()
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in UniSat Wallet')
    }

    const address = accounts[0]
    
    // Get network
    const network = await unisat.getNetwork()
    const networkMap: Record<string, 'mainnet' | 'testnet'> = {
      'livenet': 'mainnet',
      'testnet': 'testnet',
    }

    return {
      address,
      network: networkMap[network] || 'mainnet',
      provider: 'unisat',
    }
  } catch (error) {
    throw new Error(`Failed to connect to UniSat Wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if Nostr is available (via extension)
 */
function checkNostrInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).nostr
}

/**
 * Connect to Nostr (for Bitcoin payments)
 * Note: Nostr is primarily for social, but can be used for Bitcoin payments
 */
async function connectNostr(): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available')
  }

  const nostr = (window as any).nostr

  if (!nostr) {
    throw new Error('Nostr extension is not installed')
  }

  try {
    // Get public key
    const publicKey = await nostr.getPublicKey()
    
    if (!publicKey) {
      throw new Error('No public key found in Nostr')
    }

    // Nostr doesn't directly provide Bitcoin address, so we'll use the pubkey
    // In a real implementation, you'd derive the address from the pubkey
    const address = `nostr:${publicKey.substring(0, 16)}...`

    return {
      address,
      network: 'mainnet',
      provider: 'nostr',
      publicKey,
    }
  } catch (error) {
    throw new Error(`Failed to connect to Nostr: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Sign a message with the connected wallet
 */
export async function signMessage(
  providerId: string,
  message: string
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available')
  }

  try {
    switch (providerId) {
      case 'hiro': {
        const hiro = (window as any).hiro?.wallet || (window as any).StacksProvider
        if (!hiro) throw new Error('Hiro Wallet not connected')
        const result = await hiro.request('stx_signMessage', { message })
        return result.signature
      }
      case 'xverse': {
        const XverseProviders = (window as any).XverseProviders
        if (!XverseProviders?.BitcoinProvider) throw new Error('Xverse not connected')
        const provider = new XverseProviders.BitcoinProvider('MineSentry')
        const result = await provider.signMessage(message)
        return result.signature
      }
      case 'leather': {
        const btc = (window as any).btc || (window as any).LeatherProvider
        if (!btc) throw new Error('Leather Wallet not connected')
        const result = await btc.signMessage(message)
        return result.signature
      }
      case 'unisat': {
        const unisat = (window as any).unisat
        if (!unisat) throw new Error('UniSat Wallet not connected')
        const result = await unisat.signMessage(message)
        return result.signature
      }
      case 'nostr': {
        const nostr = (window as any).nostr
        if (!nostr) throw new Error('Nostr not connected')
        // Nostr uses different signing mechanism
        const event = {
          kind: 1,
          content: message,
          tags: [],
          created_at: Math.floor(Date.now() / 1000),
        }
        const signedEvent = await nostr.signEvent(event)
        return JSON.stringify(signedEvent)
      }
      default:
        throw new Error(`Unsupported wallet: ${providerId}`)
    }
  } catch (error) {
    throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Wallet provider configurations
 */
export const WALLET_PROVIDERS: WalletProvider[] = [
  {
    id: 'hiro',
    name: 'Hiro Wallet',
    downloadUrl: 'https://www.hiro.so/wallet/install-web',
  },
  {
    id: 'xverse',
    name: 'Xverse',
    downloadUrl: 'https://www.xverse.app/',
  },
  {
    id: 'leather',
    name: 'Leather',
    downloadUrl: 'https://leather.io/install-extension',
  },
  {
    id: 'unisat',
    name: 'UniSat',
    downloadUrl: 'https://unisat.io/',
  },
  {
    id: 'nostr',
    name: 'Nostr',
    downloadUrl: 'https://nostr.com/',
  },
]

/**
 * Check which wallets are installed
 */
export function checkInstalledWallets(): Record<string, boolean> {
  return {
    hiro: checkHiroInstalled(),
    xverse: checkXverseInstalled(),
    leather: checkLeatherInstalled(),
    unisat: checkUniSatInstalled(),
    nostr: checkNostrInstalled(),
  }
}

/**
 * Connect to a specific wallet provider
 */
export async function connectWallet(providerId: string): Promise<WalletConnection> {
  switch (providerId) {
    case 'hiro':
      return connectHiro()
    case 'xverse':
      return connectXverse()
    case 'leather':
      return connectLeather()
    case 'unisat':
      return connectUniSat()
    case 'nostr':
      return connectNostr()
    default:
      throw new Error(`Unsupported wallet provider: ${providerId}`)
  }
}

/**
 * Disconnect from wallet (cleanup if needed)
 */
export async function disconnectWallet(providerId: string): Promise<void> {
  // Most wallets don't require explicit disconnect
  // But we can clear any cached state here if needed
  console.log(`Disconnected from ${providerId}`)
}

