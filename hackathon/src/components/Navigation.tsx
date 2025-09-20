import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Info, BarChart3 } from 'lucide-react'

function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: '/about', label: 'About', icon: Info },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

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
