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

// Mock bounty contract
export const mockBountyContract: BountyContract = {
  contract_id: 'demo-contract-001',
  state: 'active',
  total_funded_sats: 1000000,
  total_paid_sats: 75000,
  total_reserved_sats: 150000,
  available_funds_sats: 775000,
  min_signatures: 2,
  authorized_signers: [
    'tb1qsigner1111111111abcdefghijklmnopqrstuv',
    'tb1qsigner2222222222abcdefghijklmnopqrstuv',
    'tb1qsigner3333333333abcdefghijklmnopqrstuv',
  ],
  pending_payments: 1,
  total_payments: 1,
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
export interface LeaderboardEntry {
  rank: number
  address: string
  reports: number
  verified: number
  totalBounty: number
}

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
