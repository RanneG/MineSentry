import axios from 'axios'
import type {
  MiningPoolReport,
  SystemStats,
  SystemStatus,
  BountyContract,
  BountyPayment,
  BountyHunterEntry,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred'
    return Promise.reject(new Error(message))
  }
)

export const apiClient = {
  // Health & Status
  async getHealth() {
    const { data } = await api.get('/health')
    return data
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const { data } = await api.get('/system/status')
    return data
  },

  async getStats(): Promise<SystemStats> {
    const { data } = await api.get('/stats')
    return data
  },

  // Reports
  async getReports(params?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<MiningPoolReport[]> {
    const { data } = await api.get('/reports', { params })
    return data
  },

  async getReport(reportId: string): Promise<MiningPoolReport> {
    const { data } = await api.get(`/reports/${reportId}`)
    return data
  },

  async submitReport(reportData: {
    reporter_address: string
    pool_address: string
    pool_name?: string
    block_height: number
    evidence_type: string
    transaction_ids?: string[]
    block_hash?: string
    description?: string
  }): Promise<MiningPoolReport> {
    const { data } = await api.post('/reports', reportData)
    return data
  },

  async validateReport(reportId: string) {
    const { data } = await api.post(`/reports/${reportId}/validate`)
    return data
  },

  async updateReportStatus(
    reportId: string,
    status: string,
    verifiedBy?: string
  ): Promise<MiningPoolReport> {
    const { data } = await api.patch(`/reports/${reportId}/status`, {
      status,
      verified_by: verifiedBy,
    })
    return data
  },

  async deleteReport(reportId: string): Promise<{ message: string; report_id: string }> {
    const { data } = await api.delete(`/reports/${reportId}`)
    return data
  },

  // Bounty Contract
  async getBountyContractStatus(): Promise<BountyContract | null> {
    try {
      const { data } = await api.get('/bounty/contract/status')
      return data
    } catch (error: any) {
      // If 404, contract is not configured
      if (error?.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  // Note: Setup endpoint removed - contract setup should only be done via backend scripts
  // async setupBountyContract() - REMOVED FOR SECURITY

  async getBountyPaymentQueue(): Promise<BountyPayment[]> {
    const { data } = await api.get('/bounty/payments/queue')
    return data
  },

  async createBountyPayment(
    reportId: string,
    recipientAddress?: string
  ) {
    const { data } = await api.post(`/bounty/payments/${reportId}/create`, {
      recipient_address: recipientAddress,
    })
    return data
  },

  async approveBountyPayment(
    paymentId: string,
    signerAddress: string
  ) {
    const { data } = await api.post(`/bounty/payments/${paymentId}/approve`, {
      signer_address: signerAddress,
    })
    return data
  },

  async executeBountyPayment(paymentId: string) {
    const { data } = await api.post(`/bounty/payments/${paymentId}/execute`)
    return data
  },

  // Leaderboard
  async getLeaderboard(): Promise<any[]> {
    const { data } = await api.get('/leaderboard')
    return data
  },

  async getBountyHuntersLeaderboard(limit: number = 100): Promise<BountyHunterEntry[]> {
    const { data } = await api.get('/leaderboard/bounty-hunters', { params: { limit } })
    return data
  },

  // Validation/Voting
  async submitValidatorVote(
    reportId: string,
    vote: 'confirm' | 'reject',
    validatorAddress: string,
    stakeAmountSats: number
  ) {
    const { data } = await api.post(`/reports/${reportId}/vote`, {
      validator_address: validatorAddress,
      vote_decision: vote,
      stake_amount_sats: stakeAmountSats,
    })
    return data
  },
}

export default apiClient

