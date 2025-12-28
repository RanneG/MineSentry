/**
 * Mock API data for demo mode
 * Provides fake data so users can explore the app without impacting real configuration
 */

import type {
  MiningPoolReport,
  SystemStats,
  SystemStatus,
  BountyContract,
  BountyPayment,
  BountyHunterEntry,
  LeaderboardEntry,
} from '@/types'

// Mock reports
const mockReports: MiningPoolReport[] = [
  {
    report_id: 'demo-report-001',
    reporter_address: 'tb1qdemo1234567890abcdefghijklmnopqrstuvwxyz',
    pool_address: 'bc1qf2pool1234567890abcdefghijklmnopqrstuvwxyz',
    pool_name: 'Foundry USA',
    block_height: 840123,
    evidence_type: 'censorship',
    transaction_ids: [
      'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
      'xyz987wvu654tsr321qpo098nml765kji432hgf109edc876ba',
    ],
    block_hash: '0000000000000000000123456789abcdef0123456789abcdef0123456789abcdef',
    description: 'Demo report: Pool ignored high-fee transactions in block 840123',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'pending',
    bounty_amount: 50000,
  },
  {
    report_id: 'demo-report-002',
    reporter_address: 'tb1qdemo1234567890abcdefghijklmnopqrstuvwxyz',
    pool_address: 'bc1qantpool1234567890abcdefghijklmnopqrstuvwxyz',
    pool_name: 'AntPool',
    block_height: 840120,
    evidence_type: 'selfish_mining',
    transaction_ids: [
      'def456ghi789jkl012mno345pqr678stu901vwx234yzabc123',
    ],
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: 'under_review',
    bounty_amount: 100000,
  },
  {
    report_id: 'demo-report-003',
    reporter_address: 'tb1qdemo1234567890abcdefghijklmnopqrstuvwxyz',
    pool_address: 'bc1qf2pool9876543210zyxwvutsrqponmlkjihgfedcba',
    pool_name: 'F2Pool',
    block_height: 840115,
    evidence_type: 'double_spend_attempt',
    transaction_ids: [],
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'verified',
    bounty_amount: 75000,
    verification_txid: 'demo-tx-123456789',
    verified_by: 'tb1qvalidator1234567890abcdefghijklmnopqrstuv',
    verified_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
  },
]

// Mock system stats
export const mockSystemStats: SystemStats = {
  total_reports: 3,
  verified_reports: 1,
  pending_reports: 1,
  rejected_reports: 0,
  total_bounty_paid_sats: 75000,
  total_bounty_paid_btc: 0.00075,
  bounty_contract: {
    available_funds_sats: 500000,
    total_paid_sats: 75000,
    pending_payments: 1,
  },
}

// Mock system status
export const mockSystemStatus: SystemStatus = {
  system: 'MineSentry Demo',
  bitcoin_rpc: {
    connected: true,
    block_height: 840200,
    blocks: 840200,
    network: 'testnet',
    chain: 'test',
    verification_progress: 1.0,
    difficulty: 50314475191.86,
    connections: 8,
    rpc_url: 'http://127.0.0.1:18332',
  },
  database: {
    connected: true,
    total_reports: 3,
    verified_reports: 1,
  },
  spells: {
    censorship_detection: true,
    bounty_contract: true,
  },
}

// Mock bounty contract (transparency dashboard format)
export const mockBountyContract: BountyContract = {
  contract_id: 'demo-contract-001',
  state: 'active',
  total_funded_sats: 1000000,
  total_paid_sats: 25000, // Only the 'paid' payment (demo-payment-004)
  total_reserved_sats: 220000, // Sum of pending + approved payments (50000 + 35000 + 75000 + 60000)
  available_funds_sats: 755000, // 1000000 - 25000 - 220000
  min_signatures: 2,
  authorized_signers: [
    'tb1qsigner1111111111abcdefghijklmnopqrstuv',
    'tb1qsigner2222222222abcdefghijklmnopqrstuv',
    'tb1qsigner3333333333abcdefghijklmnopqrstuv',
  ],
  pending_payments: 3, // 3 pending payments (demo-payment-001, 003, 005)
  total_payments: 1, // Only paid payments count
  // Transparency dashboard fields
  contract_address: 'tb1qsigner1111111111abcdefghijklmnopqrstuv', // Use first signer as demo contract address
  balance_btc: 0.00755,
  balance_sats: 755000,
  network: 'Testnet',
  network_type: 'test',
  signature_threshold: '2 of 3',
  created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  payout_history: [
    {
      date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      report_id: 'demo-report-007',
      recipient: 'tb1qreporter9876543210zyxwvutsrqponmlkjihgfedcba',
      amount_btc: 0.0005,
      amount_sats: 50000,
      txid: 'demo-tx-9876543210987654321098765432109876543210987654321098765432109876',
    },
    {
      date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      report_id: 'demo-report-006',
      recipient: 'tb1qreporter1111111111abcdefghijklmnopqrstuv',
      amount_btc: 0.00035,
      amount_sats: 35000,
      txid: 'demo-tx-1111111111111111111111111111111111111111111111111111111111111111',
    },
    {
      date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      report_id: 'demo-report-005',
      recipient: 'tb1qreporter2222222222abcdefghijklmnopqrstuv',
      amount_btc: 0.0001,
      amount_sats: 10000,
      txid: 'demo-tx-2222222222222222222222222222222222222222222222222222222222222222',
    },
    {
      date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      report_id: 'demo-report-004',
      recipient: 'tb1qreporter4567890abcdefghijklmnopqrstuvwxyz0',
      amount_btc: 0.00025,
      amount_sats: 25000,
      txid: 'demo-tx-1234567890123456789012345678901234567890123456789012345678901234',
    },
    {
      date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      report_id: 'demo-report-003',
      recipient: 'tb1qreporter34567890abcdefghijklmnopqrstuvwxy',
      amount_btc: 0.00075,
      amount_sats: 75000,
      txid: 'demo-tx-3333333333333333333333333333333333333333333333333333333333333333',
    },
    {
      date: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      report_id: 'demo-report-002',
      recipient: 'tb1qreporter234567890abcdefghijklmnopqrstuvw',
      amount_btc: 0.00015,
      amount_sats: 15000,
      txid: 'demo-tx-4444444444444444444444444444444444444444444444444444444444444444',
    },
  ],
}

// Mock API functions
export function getMockReports(status?: string): MiningPoolReport[] {
  if (status && status !== 'all') {
    return mockReports.filter((r) => r.status === status)
  }
  return [...mockReports]
}

export function getMockReport(reportId: string): MiningPoolReport | null {
  return mockReports.find((r) => r.report_id === reportId) || null
}

export function submitMockReport(data: {
  reporter_address: string
  pool_address: string
  pool_name?: string
  block_height: number
  evidence_type: string
  transaction_ids?: string[]
  block_hash?: string
  description?: string
}): MiningPoolReport {
  const newReport: MiningPoolReport = {
    report_id: `demo-${Date.now()}`,
    reporter_address: data.reporter_address,
    pool_address: data.pool_address,
    pool_name: data.pool_name,
    block_height: data.block_height,
    evidence_type: data.evidence_type as any,
    transaction_ids: data.transaction_ids || [],
    block_hash: data.block_hash,
    description: data.description,
    timestamp: new Date().toISOString(),
    status: 'pending',
    bounty_amount: 50000,
  }
  
  // Add to mock reports (only in memory, not persisted)
  mockReports.unshift(newReport)
  
  return newReport
}

// Mock leaderboard data
// LeaderboardEntry type is imported from @/types

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    address: 'bc1qreporter1234567890abcdefghijklmnopqrstuvwxyz',
    reports: 15,
    verified: 12,
    totalBounty: 0.0125,
  },
  {
    rank: 2,
    address: 'bc1qreporter9876543210zyxwvutsrqponmlkjihgfedcba',
    reports: 10,
    verified: 8,
    totalBounty: 0.008,
  },
  {
    rank: 3,
    address: 'bc1qvalidator1234567890abcdefghijklmnopqrstuvwxyz',
    reports: 8,
    verified: 6,
    totalBounty: 0.005,
  },
  {
    rank: 4,
    address: 'bc1qcontributor1111111111abcdefghijklmnopqrstuv',
    reports: 6,
    verified: 5,
    totalBounty: 0.003,
  },
  {
    rank: 5,
    address: 'bc1qcontributor2222222222abcdefghijklmnopqrstuv',
    reports: 4,
    verified: 3,
    totalBounty: 0.002,
  },
]

export function getMockLeaderboard(): LeaderboardEntry[] {
  return [...mockLeaderboard]
}

// Mock Bounty Hunters Leaderboard

export const mockBountyHunters: BountyHunterEntry[] = [
  {
    rank: 1,
    address: 'bc1qreporter1234567890abcdefghijklmnopqrstuvwxyz',
    total_bounties_earned_btc: 0.015,
    total_bounties_earned_sats: 1500000,
    successful_claims_count: 8,
    largest_bounty_btc: 0.003,
    largest_bounty_sats: 300000,
  },
  {
    rank: 2,
    address: 'bc1qreporter9876543210zyxwvutsrqponmlkjihgfedcba',
    total_bounties_earned_btc: 0.012,
    total_bounties_earned_sats: 1200000,
    successful_claims_count: 6,
    largest_bounty_btc: 0.0025,
    largest_bounty_sats: 250000,
  },
  {
    rank: 3,
    address: 'bc1qvalidator1234567890abcdefghijklmnopqrstuvwxyz',
    total_bounties_earned_btc: 0.008,
    total_bounties_earned_sats: 800000,
    successful_claims_count: 5,
    largest_bounty_btc: 0.002,
    largest_bounty_sats: 200000,
  },
  {
    rank: 4,
    address: 'bc1qcontributor1111111111abcdefghijklmnopqrstuv',
    total_bounties_earned_btc: 0.005,
    total_bounties_earned_sats: 500000,
    successful_claims_count: 4,
    largest_bounty_btc: 0.0015,
    largest_bounty_sats: 150000,
  },
  {
    rank: 5,
    address: 'bc1qcontributor2222222222abcdefghijklmnopqrstuv',
    total_bounties_earned_btc: 0.003,
    total_bounties_earned_sats: 300000,
    successful_claims_count: 3,
    largest_bounty_btc: 0.001,
    largest_bounty_sats: 100000,
  },
]

export function getMockBountyHunters(): BountyHunterEntry[] {
  return [...mockBountyHunters]
}

// Mock Bounty Payments
export const mockBountyPayments: BountyPayment[] = [
  {
    payment_id: 'demo-payment-001',
    report_id: 'demo-report-001',
    recipient_address: 'tb1qreporter1234567890abcdefghijklmnopqrstu',
    amount_sats: 50000,
    amount_btc: 0.0005,
    status: 'pending',
    approvers: [],
    approvals: '',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    payment_id: 'demo-payment-002',
    report_id: 'demo-report-002',
    recipient_address: 'tb1qreporter234567890abcdefghijklmnopqrstuvw',
    amount_sats: 35000,
    amount_btc: 0.00035,
    status: 'approved',
    approvers: ['tb1qsigner1234567890abcdefghijklmnopqrstuvwx'],
    approvals: '1/2',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    payment_id: 'demo-payment-003',
    report_id: 'demo-report-003',
    recipient_address: 'tb1qreporter34567890abcdefghijklmnopqrstuvwxy',
    amount_sats: 75000,
    amount_btc: 0.00075,
    status: 'pending',
    approvers: ['tb1qsigner1234567890abcdefghijklmnopqrstuvwx'],
    approvals: '1/2',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    payment_id: 'demo-payment-004',
    report_id: 'demo-report-004',
    recipient_address: 'tb1qreporter4567890abcdefghijklmnopqrstuvwxyz0',
    amount_sats: 25000,
    amount_btc: 0.00025,
    status: 'paid',
    approvers: [
      'tb1qsigner1234567890abcdefghijklmnopqrstuvwx',
      'tb1qsigner234567890abcdefghijklmnopqrstuvwxy',
    ],
    approvals: '2/2',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    payment_id: 'demo-payment-005',
    report_id: 'demo-report-005',
    recipient_address: 'tb1qreporter567890abcdefghijklmnopqrstuvwxyz01',
    amount_sats: 60000,
    amount_btc: 0.0006,
    status: 'pending',
    approvers: [],
    approvals: '',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
]

export function getMockBountyPayments(): BountyPayment[] {
  return [...mockBountyPayments]
}
