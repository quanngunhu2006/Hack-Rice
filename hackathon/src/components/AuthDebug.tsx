import { useAuth0 } from '@auth0/auth0-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function AuthDebug() {
  const { isAuthenticated, user, isLoading, error, logout, loginWithRedirect, getAccessTokenSilently } = useAuth0()

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Auth Debug
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? "Logged In" : "Logged Out"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </div>
        {user && (
          <div>
            <strong>User:</strong> {user.name} ({user.email})
          </div>
        )}
        {error && (
          <div className="text-red-500">
            <strong>Error:</strong> {error.message}
          </div>
        )}
        <div className="flex gap-2 pt-2 flex-wrap">
          {!isAuthenticated ? (
            <Button size="sm" onClick={() => loginWithRedirect()}>
              Login
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => logout()}>
                Logout
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const token = await getAccessTokenSilently()
                    console.log('Access Token:', token)
                    alert('Token logged to console!')
                  } catch (error) {
                    console.error('Token error:', error)
                    alert('Failed to get token')
                  }
                }}
              >
                Get Token
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuthDebug
