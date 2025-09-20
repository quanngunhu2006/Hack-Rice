import { Routes, Route, useLocation } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import AuthDebug from '@/components/AuthDebug'
import UserProfile from '@/components/UserProfile'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'

function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className={isHomePage ? '' : 'lg:ml-64'}>
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="py-8">
                  <UserProfile />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
          </Routes>
          <AuthDebug />
        </div>
      </div>
    </div>
  )
}

export default App