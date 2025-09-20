import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { RefreshCw, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Info, Phone, BarChart3, LogIn, LogOut, User, Settings } from 'lucide-react'

function Navigation() {
  const location = useLocation()
  const { isAuthenticated, user, logout, loginWithRedirect, isLoading } = useAuth0()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Determine if we should show sidebar or overhead navigation
  const isHomePage = location.pathname === '/'
  const showSidebar = !isHomePage

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
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/dashboard`
      }
    })
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

  // Overhead Navigation (for Home page)
  const OverheadNav = () => (
    <nav className="border-b bg-background">
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
          {navItems.map(({ path, label, icon: Icon, requiresAuth }) => {
            // Hide auth-required pages if not authenticated
            if (requiresAuth && !isAuthenticated) return null

            return (
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
            )
          })}
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading...
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.name ? getUserInitials(user.name) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )

  // Sidebar Navigation (for Dashboard and other pages)
  const SidebarNav = () => (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-background border-r z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold">HR</span>
            </div>
            <span className="text-xl font-semibold">HackRice</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {navItems.map(({ path, label, icon: Icon, requiresAuth }) => {
              // Hide auth-required pages if not authenticated
              if (requiresAuth && !isAuthenticated) return null

              return (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link 
                    to={path} 
                    className="flex items-center gap-3"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t pt-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading...
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-3">
                {/* User Profile */}
                <div className="flex items-center gap-3 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name ? getUserInitials(user.name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="flex-1"
                    title="Refresh authentication state"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  )

  return showSidebar ? <SidebarNav /> : <OverheadNav />
}

export default Navigation