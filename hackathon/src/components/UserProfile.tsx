import { useAuth0 } from '@auth0/auth0-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, User, Calendar, Shield } from 'lucide-react'

function UserProfile() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()

  if (!isAuthenticated || !user) {
    return null
  }

  const handleGetToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      console.log('🔑 Access Token:', token)
      alert('Token logged to console! Check Developer Tools → Console')
    } catch (error) {
      console.error('❌ Token error:', error)
      alert('Failed to get access token')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name || 'User'}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          {user.email_verified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Email Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-muted-foreground">{user.nickname || 'N/A'}</p>
            </div>
          </div>

          {user.updated_at && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-sm text-muted-foreground font-mono text-xs">
                {user.sub?.split('|')[1] || user.sub}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Authentication Tokens</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                🔑 Access Token
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Used for API calls to your backend services
              </p>
              <Button size="sm" onClick={handleGetToken}>
                Get Access Token
              </Button>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🎫 ID Token
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Contains user identity information (name, email, etc.)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Raw User Data</h3>
          <div className="bg-muted p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs text-muted-foreground">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfile
