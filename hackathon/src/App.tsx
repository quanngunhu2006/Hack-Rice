import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
  const location = useLocation()
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/map" element={
            <div className="lg:ml-64">
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <MapPage />
              </motion.div>
            </div>
          } />
          <Route path="/*" element={
            <div className="lg:ml-64">
              <div className="container mx-auto px-4 py-8">
                <Routes location={location}>
                  <Route path="/" element={
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                      <Explore />
                    </motion.div>
                  } />
                  <Route path="/proposals/:id" element={
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                      <ProposalDetail />
                    </motion.div>
                  } />
                  <Route path="/propose" element={
                    <ProtectedRoute>
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                        <Propose />
                      </motion.div>
                    </ProtectedRoute>
                  } />
                  <Route path="/account" element={
                    <ProtectedRoute>
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                        <Account />
                      </motion.div>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                        <Admin />
                      </motion.div>
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                      <Login />
                    </motion.div>
                  } />
                </Routes>
              </div>
            </div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App