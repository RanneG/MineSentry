import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import SubmitReport from './pages/SubmitReport'
import ReportDetail from './pages/ReportDetail'
import BountyContract from './pages/BountyContract'
import Leaderboard from './pages/Leaderboard'
import SystemStatus from './pages/SystemStatus'
import { Toaster } from '@/components/ui/Toaster'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:reportId" element={<ReportDetail />} />
          <Route path="/submit" element={<SubmitReport />} />
          <Route path="/bounty" element={<BountyContract />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/status" element={<SystemStatus />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  )
}

export default App

