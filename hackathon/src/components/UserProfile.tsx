import { useAuth0 } from '@auth0/auth0-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Calendar, Shield, Edit } from 'lucide-react'

function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {user.name ? getUserInitials(user.name) : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name || 'Anonymous User'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </CardDescription>
              <Badge variant="secondary" className="mt-2">
                <Shield className="h-3 w-3 mr-1" />
                Verified User
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{user.name || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            </div>

            {user.email_verified && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email Status</label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            )}

            {user.updated_at && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(user.updated_at)}</span>
                </div>
              </div>
            )}
          </div>

          {user.nickname && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nickname</label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{user.nickname}</span>
              </div>
            </div>
          )}

          {user.picture && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Profile Picture URL</label>
              <div className="p-2 border rounded-md bg-muted text-xs font-mono break-all">
                {user.picture}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Update Email
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfile
