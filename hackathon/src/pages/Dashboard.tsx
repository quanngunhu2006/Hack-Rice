import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth0 } from '@auth0/auth0-react'
import { Activity, Users, DollarSign, TrendingUp, User, Mail, Calendar } from 'lucide-react'

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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your project.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className={`text-sm flex items-center gap-1 ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* User Profile Section */}
        {isAuthenticated && user && (
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.name || 'User'}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.nickname || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {user.email_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <Badge variant="secondary">{activity.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Add User</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm">Billing</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
