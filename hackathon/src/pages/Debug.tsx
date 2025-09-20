import { useAuth0 } from '@auth0/auth0-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function Debug() {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims
  } = useAuth0()

  const handleGetToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      console.log('🔑 Access Token:', token)
      alert('Access Token logged to console!')
    } catch (error) {
      console.error('❌ Token error:', error)
      alert('Failed to get access token: ' + error.message)
    }
  }

  const handleGetIdToken = async () => {
    try {
      const claims = await getIdTokenClaims()
      console.log('🆔 ID Token Claims:', claims)
      alert('ID Token Claims logged to console!')
    } catch (error) {
      console.error('❌ ID Token error:', error)
      alert('Failed to get ID token: ' + error.message)
    }
  }

  const handleCheckLocalStorage = () => {
    const keys = Object.keys(localStorage).filter(key => key.includes('auth0'))
    console.log('🔍 Auth0 LocalStorage keys:', keys)
    keys.forEach(key => {
      console.log(`${key}:`, localStorage.getItem(key))
    })
    alert(`Found ${keys.length} Auth0-related localStorage keys. Check console for details.`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Authentication Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Loading:</strong>
                <Badge variant={isLoading ? "default" : "secondary"}>
                  {isLoading ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <strong>Authenticated:</strong>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {user && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">User Information:</h3>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
              </div>
            )}

            {error && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 text-red-600">Error:</h3>
                <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800">
                  {error.message}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Actions:</h3>
              <div className="flex flex-wrap gap-2">
                {!isAuthenticated ? (
                  <Button onClick={() => loginWithRedirect()}>
                    Login
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => logout()}>
                      Logout
                    </Button>
                    <Button variant="outline" onClick={handleGetToken}>
                      Get Access Token
                    </Button>
                    <Button variant="outline" onClick={handleGetIdToken}>
                      Get ID Token
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={handleCheckLocalStorage}>
                  Check LocalStorage
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Environment Variables:</h3>
              <div className="bg-muted p-4 rounded-lg text-sm font-mono">
                <div>VITE_AUTH0_DOMAIN: {import.meta.env.VITE_AUTH0_DOMAIN || 'undefined'}</div>
                <div>VITE_AUTH0_CLIENT_ID: {import.meta.env.VITE_AUTH0_CLIENT_ID || 'undefined'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Debug
