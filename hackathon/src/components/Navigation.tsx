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
    { path: '/', label: 'Home', icon: Home },
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
    <Card className="p-4 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-2">
          {navItems.map(({ path, label, icon: Icon, requiresAuth }) => {
            // Hide auth-required pages if not authenticated
            if (requiresAuth && !isAuthenticated) return null

            return (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link to={path} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading...
            </div>
          ) : isAuthenticated ? (
            <>
              {/* User Profile */}
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name ? getUserInitials(user.name) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-muted-foreground">
                  {user?.name}
                </span>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
                title="Refresh authentication state"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant={location.pathname === '/login' ? "default" : "outline"}
              size="sm"
              onClick={handleLogin}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default Navigation
