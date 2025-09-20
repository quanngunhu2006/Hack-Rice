import { ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to access this page
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <Button onClick={() => loginWithRedirect()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
