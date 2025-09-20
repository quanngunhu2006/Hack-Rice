import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Home, Info, Phone, BarChart3, LogIn, LogOut, User, Settings } from 'lucide-react'

function Navigation() {
  const location = useLocation()
  const { isAuthenticated, user, logout, loginWithRedirect, isLoading } = useAuth0()

  // Monitor authentication state changes
  useEffect(() => {
    console.log('Navigation Auth state changed:', {
      isAuthenticated,
      user,
      isLoading,
      userName: user?.name,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    })
  }, [isAuthenticated, user, isLoading])

  // Debug logging (remove in production)
  console.log('Navigation render - Auth state:', {
    isAuthenticated,
    user,
    isLoading,
    userName: user?.name,
    userEmail: user?.email
  })

  const navItems = [
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Phone },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, requiresAuth: true },
    { path: '/profile', label: 'Profile', icon: User, requiresAuth: true },
    { path: '/debug', label: 'Debug', icon: Settings },
  ]

  const handleLogin = () => {
    loginWithRedirect()
  }

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: `${window.location.origin}/`
      }
    })
  }

  const handleRefresh = () => {
    // First try to force re-check auth state
    console.log('Manual refresh triggered - current state:', { isAuthenticated, user, isLoading })
    // If still not working, reload the page
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold">HR</span>
          </div>
          <span className="text-xl font-semibold">HackRice</span>
        </Link>

        {/* Navigation Links & Login Button */}
        <div className="flex items-center space-x-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 text-sm ${
                location.pathname === path
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <Button>Login</Button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
