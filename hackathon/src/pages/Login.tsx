import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Github, Chrome, AlertCircle, Loader2, Lock } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0()

  const handleEmailLogin = () => loginWithRedirect()

  const handleSocialLogin = () => {
    // Let Auth0 handle social login selection through Universal Login
    loginWithRedirect()
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated && !isLoading) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || 'Authentication failed'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleEmailLogin}
              className="w-full h-12 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isLoading ? 'Signing in...' : 'Continue with Email'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleSocialLogin}
                className="h-12 flex items-center gap-2"
                disabled={isLoading}
              >
                <Chrome className="h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleSocialLogin}
                className="h-12 flex items-center gap-2"
                disabled={isLoading}
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Secure authentication powered by Auth0
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
