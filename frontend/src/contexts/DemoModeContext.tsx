import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from '@/components/ui/Toaster'

interface DemoModeContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
  demoWalletAddress: string
  demoNetwork: 'testnet' | 'mainnet' | 'signet' | 'regtest'
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined)

export function DemoModeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage immediately to prevent state reset
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('minesentry-demo-mode')
      return stored === 'true'
    }
    return false
  })

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('minesentry-demo-mode', isDemoMode.toString())
    }
  }, [isDemoMode])

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const newState = !prev
      if (newState) {
        toast.info('Demo Mode ON: Using mock data. No real transactions or database writes.')
      } else {
        toast.info('Demo Mode OFF: Using real API. Connect your wallet for full functionality.')
      }
      return newState
    })
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
