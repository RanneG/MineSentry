import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Filter, FileText, Trash2, Loader2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { toast } from '@/components/ui/Toaster'
import type { ReportStatus } from '@/types'
import { useDemoMode } from '@/contexts/DemoModeContext'

const STATUS_FILTERS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Reports() {
  const { isDemoMode } = useDemoMode()
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', statusFilter === 'all' ? null : statusFilter],
    queryFn: () => {
      // Use real reports from API for both demo and non-demo modes
      return apiClient.getReports({ status: statusFilter === 'all' ? undefined : statusFilter })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      if (isDemoMode) {
        // In demo mode, just simulate deletion
        await new Promise((resolve) => setTimeout(resolve, 300))
        return { success: true }
      }
      return apiClient.deleteReport(reportId)
    },
    onSuccess: () => {
      if (isDemoMode) {
        toast.success('Demo Mode: Report would be deleted (not actually deleted)')
      } else {
        toast.success('Report deleted successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setDeletingId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      setDeletingId(null)
    },
  })

  const handleDelete = (reportId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      setDeletingId(reportId)
      deleteMutation.mutate(reportId)
    }
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'status-badge status-pending',
      verified: 'status-badge status-verified',
      rejected: 'status-badge status-rejected',
      under_review: 'status-badge status-under-review',
    }
    return <span className={classes[status as keyof typeof classes] || classes.pending}>{status}</span>
  }

  const filteredReports = reports?.filter((report) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      report.report_id.toLowerCase().includes(query) ||
      report.pool_address.toLowerCase().includes(query) ||
      report.block_height.toString().includes(query) ||
      report.evidence_type.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Reports</h1>
        <p className="text-text-secondary mt-1">Browse and manage mining pool reports</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-text-secondary w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
              className="input w-auto"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !filteredReports || filteredReports.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-secondary">No reports found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-light">
                <tr>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Pool</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Block</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Bounty</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.report_id}
                    className="border-t border-border hover:bg-surface-light transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/reports/${report.report_id}`}
                  >
                    <td className="py-3 px-4">
                      <Link
                        to={`/reports/${report.report_id}`}
                        className="text-primary hover:underline font-mono text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {report.report_id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-text">
                      {report.pool_name || report.pool_address.substring(0, 12)}...
                    </td>
                    <td className="py-3 px-4 text-text">{report.block_height.toLocaleString()}</td>
                    <td className="py-3 px-4 text-text-secondary text-sm">{report.evidence_type}</td>
                    <td className="py-3 px-4">{getStatusBadge(report.status)}</td>
                    <td className="py-3 px-4 text-text">
                      {(report.bounty_amount / 100000000).toFixed(4)} BTC
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-sm">
                      {format(new Date(report.timestamp), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      {report.status !== 'verified' && (
                        <button
                          onClick={(e) => handleDelete(report.report_id, e)}
                          disabled={deletingId === report.report_id}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50 p-1"
                          title="Delete report"
                        >
                          {deletingId === report.report_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

