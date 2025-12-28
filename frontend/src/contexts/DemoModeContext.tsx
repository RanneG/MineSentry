import { createContext, useContext, useState, ReactNode } from 'react'

interface DemoModeContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
  demoWalletAddress: string
  demoNetwork: 'testnet' | 'mainnet' | 'signet' | 'regtest'
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined)

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev)
  }

  const demoWalletAddress = 'tb1qdemo1234567890abcdefghijklmnopqrstuvwxyz'
  const demoNetwork: 'testnet' = 'testnet'

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        demoWalletAddress,
        demoNetwork,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider')
  }
  return context
}
