import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Home, Info, Phone, BarChart3, LogIn, LogOut, User } from 'lucide-react'

function Navigation() {
  const location = useLocation()
  const { isAuthenticated, user, logout, loginWithRedirect, isLoading } = useAuth0()
  const [authState, setAuthState] = useState(isAuthenticated)

  useEffect(() => {
    setAuthState(isAuthenticated)
  }, [isAuthenticated])

  // Debug logging (remove in production)
  // console.log('Navigation Auth state:', {
  //   isAuthenticated,
  //   user,
  //   isLoading,
  //   userName: user?.name,
  //   userEmail: user?.email,
  //   authState
  // })

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Phone },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, requiresAuth: true },
    { path: '/profile', label: 'Profile', icon: User, requiresAuth: true },
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
    window.location.reload()
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
            if (requiresAuth && !authState) return null

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
          ) : authState ? (
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
