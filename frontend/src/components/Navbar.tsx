import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import WalletConnect from './WalletConnect'

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/reports', label: 'Reports' },
  { path: '/submit', label: 'Submit Report' },
  { path: '/bounty', label: 'Bounty Contract' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/status', label: 'Status' },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Shield className="w-6 h-6" />
            <span>MineSentry</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text hover:bg-surface-light'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connect & Mobile Menu */}
          <div className="flex items-center gap-4">
            <WalletConnect />
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text hover:bg-surface-light'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

