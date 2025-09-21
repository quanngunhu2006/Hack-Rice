import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'


export default function Login() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0()
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleLogin = () => {


    loginWithRedirect()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to CityVoice</CardTitle>
          <CardDescription>
            Sign in to start participating in your community
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={handleLogin} className="w-full" size="lg">
            Sign In with Auth0
          </Button>
          <p className="text-sm text-muted-foreground">
            Join your neighbors in making your city better
          </p>
        </CardContent>
      </Card>
    </div>
  )
}