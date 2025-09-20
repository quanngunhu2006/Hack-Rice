import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Home, Info, Phone, BarChart3 } from 'lucide-react'

function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Phone },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  return (
    <Card className="p-4 mb-8">
      <nav className="flex flex-wrap gap-2 justify-center">
        {navItems.map(({ path, label, icon: Icon }) => (
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
        ))}
      </nav>
    </Card>
  )
}

export default Navigation
