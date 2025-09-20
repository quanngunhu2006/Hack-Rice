import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Explore from '@/pages/Explore'
import ProposalDetail from '@/pages/ProposalDetail'
import Propose from '@/pages/Propose'
import MapPage from '@/pages/MapPage'
import Account from '@/pages/Account'
import Admin from '@/pages/Admin'
import Login from '@/pages/Login'

function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className={!isHomePage && user ? 'lg:ml-64' : ''}>
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Explore />} />
            <Route path="/proposals/:id" element={<ProposalDetail />} />
            <Route path="/propose" element={
              <ProtectedRoute requireVerified>
                <Propose />
              </ProtectedRoute>
            } />
            <Route path="/map" element={<MapPage />} />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App