export type EvidenceType =
  | 'censorship'
  | 'double_spend_attempt'
  | 'selfish_mining'
  | 'block_reordering'
  | 'transaction_censorship'
  | 'unusual_block_template'
  | 'other'

export type ReportStatus = 'pending' | 'verified' | 'rejected' | 'under_review'

export interface MiningPoolReport {
  report_id: string
  reporter_address: string
  pool_address: string
  pool_name?: string
  block_height: number
  evidence_type: EvidenceType
  transaction_ids: string[]
  block_hash?: string
  description?: string
  timestamp: string
  status: ReportStatus
  bounty_amount: number
  verification_txid?: string
  verified_by?: string
  verified_at?: string
}

export interface BountyContract {
  contract_id: string
  state: 'active' | 'paused' | 'closed' | 'funding'
  total_funded_sats: number
  total_paid_sats: number
  total_reserved_sats: number
  available_funds_sats: number
  min_signatures: number
  authorized_signers: string[]
  pending_payments: number
  total_payments: number
  // Transparency dashboard fields
  contract_address?: string
  balance_btc?: number
  balance_sats?: number
  network?: string
  network_type?: string
  signature_threshold?: string
  payout_history?: Array<{
    date: string
    report_id: string
    recipient: string
    amount_btc: number
    amount_sats: number
    txid: string
  }>
  created_at?: string
  updated_at?: string
}

export interface BountyPayment {
  payment_id: string
  report_id: string
  recipient_address: string
  amount_sats: number
  amount_btc: number
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'failed'
  approvers: string[]
  approvals: string
  created_at: string
  approved_at?: string
}

export interface SystemStats {
  total_reports: number
  verified_reports: number
  pending_reports: number
  rejected_reports: number
  total_bounty_paid_sats: number
  total_bounty_paid_btc: number
  bounty_contract?: {
    available_funds_sats: number
    total_paid_sats: number
    pending_payments: number
  }
}

export interface SystemStatus {
  system: string
  bitcoin_rpc: {
    connected: boolean
    block_height?: number
    blocks?: number
    network?: string
    chain?: string
    verification_progress?: number
    difficulty?: number
    connections?: number
    rpc_url?: string
    best_block_hash?: string
    chain_work?: string
    size_on_disk?: number
    pruned?: boolean
    initial_block_download?: boolean
    error?: string
  }
  database: {
    connected: boolean
    total_reports?: number
    verified_reports?: number
  }
  spells: {
    censorship_detection: boolean
    bounty_contract: boolean
  }
  bounty_contract?: BountyContract
}

export interface WalletProvider {
  id: string
  name: string
  icon?: string
  installed?: boolean
}

export interface WalletState {
  connected: boolean
  address?: string
  provider?: string
  network?: 'mainnet' | 'testnet' | 'signet' | 'regtest'
}

export interface LeaderboardEntry {
  rank: number
  address: string
  reports: number
  verified: number
  totalBounty: number
}

export interface BountyHunterEntry {
  rank: number
  address: string
  total_bounties_earned_btc: number
  total_bounties_earned_sats: number
  successful_claims_count: number
  largest_bounty_btc: number
  largest_bounty_sats: number
}

