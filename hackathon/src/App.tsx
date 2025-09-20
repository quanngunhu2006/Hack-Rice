import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
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
  const { isAuthenticated } = useAuth0()
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Routes>
        <Route path="/map" element={
          <div className="lg:ml-64">
            <MapPage />
          </div>
        } />
        <Route path="/*" element={
          <div className="lg:ml-64">
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Explore />} />
                <Route path="/proposals/:id" element={<ProposalDetail />} />
                <Route path="/propose" element={
                  <ProtectedRoute>
                    <Propose />
                  </ProtectedRoute>
                } />
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
        } />
      </Routes>
    </div>
  )
}

export default App