import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth0 } from '@auth0/auth0-react'
import { Activity, Users, DollarSign, TrendingUp, User, Mail, Calendar } from 'lucide-react'
import { FileText, Eye, LogOut } from 'lucide-react'

function Dashboard() {
  const { user, isAuthenticated } = useAuth0()
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Revenue",
      value: "$45,678",
      change: "+8.2%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Active Sessions",
      value: "1,234",
      change: "-2.1%",
      icon: Activity,
      trend: "down"
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "+0.8%",
      icon: TrendingUp,
      trend: "up"
    }
  ]

  const recentActivity = [
    { id: 1, user: "John Doe", action: "Created new project", time: "2 minutes ago" },
    { id: 2, user: "Jane Smith", action: "Updated profile", time: "5 minutes ago" },
    { id: 3, user: "Mike Johnson", action: "Completed task", time: "10 minutes ago" },
    { id: 4, user: "Sarah Wilson", action: "Joined team", time: "15 minutes ago" },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r bg-card">
        <nav className="p-4 space-y-8">
          {/* Proposal Category */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground mb-2">Proposal</h2>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                asChild
              >
                <a href="#file-proposal">
                  <FileText className="h-4 w-4" />
                  File Proposal
                </a>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                asChild
              >
                <a href="#view-proposal">
                  <Eye className="h-4 w-4" />
                  View Proposal
                </a>
              </Button>
            </div>
          </div>

          {/* Account Category */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground mb-2">My Account</h2>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                asChild
              >
                <a href="#my-account">
                  <User className="h-4 w-4" />
                  Profile
                </a>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-background">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Content will be added here based on selected navigation */}
      </main>
    </div>
  )
}

export default Dashboard
