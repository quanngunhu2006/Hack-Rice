import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth0 } from '@auth0/auth0-react'
import { 
  Home, 
  Plus, 
  MapPin, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth0()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', icon: Home, label: 'Explore' },
    { path: '/propose', icon: Plus, label: 'Propose', requireAuth: true },
    { path: '/map', icon: MapPin, label: 'Map' },
    { path: '/account', icon: User, label: 'Account', requireAuth: true },
    { path: '/admin', icon: Settings, label: 'Admin', requireAuth: true },
  ]

  const handleSignOut = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const canAccessRoute = (item: any) => {
    if (item.requireAuth && !isAuthenticated) return false
    return true
  }

  const NavLink = ({ item }: { item: any }) => {
    const Icon = item.icon
    const isActive = isActivePath(item.path)
    const canAccess = canAccessRoute(item)

    return (
      <Link
        to={canAccess ? item.path : '/login'}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        } ${!canAccess ? 'opacity-50' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 py-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/file.svg" alt="CityVoice icon" className="w-15 h-15" />
            <h1 className="text-xl font-bold">CityVoice</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>

            {/* User section */}
            <div className="mt-auto space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm">
                    <div className="font-medium truncate">{user?.email}</div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/login">Sign In</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <Link to="/" className="flex items-center gap-2">
            <img src="/file.svg" alt="CityVoice icon" className="w-10 h-10" />
            <h1 className="text-xl font-bold">CitizenVoice</h1>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="border-b bg-background px-4 py-2">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
                
                <div className="border-t pt-2 mt-2">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm">
                        <div className="font-medium truncate">{user?.email}</div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="w-full">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  )
}