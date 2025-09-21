import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import './index.css'
import App from './App.tsx'
import { supabase } from '@/lib/supabase'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        cacheLocation="localstorage"
        useRefreshTokens={true}
        authorizationParams={{
          redirect_uri: window.location.origin,
          scope: "openid profile email"
        }}
        onRedirectCallback={(appState, user) => {
          console.log('Auth0 redirect callback:', { appState, user });

          ;(async () => {
            try {
              const auth0User: any = user
              if (auth0User?.sub) {
                const profilePayload = {
                  author_id: auth0User.sub as string,
                  email: (auth0User.email as string) || `${auth0User.sub}@placeholder.local`,
                  full_name: (auth0User.name as string) || null,
                  given_name: (auth0User.given_name as string) || null,
                  family_name: (auth0User.family_name as string) || null,
                  nickname: (auth0User.nickname as string) || null,
                  picture: (auth0User.picture as string) || null,
                  email_verified: Boolean(auth0User.email_verified),
                  connection: (auth0User.sub as string)?.split('|')[0] || null,
                }

                await supabase
                  .from('profiles')
                  .upsert([profilePayload], { onConflict: 'author_id' })
              }
            } catch (err) {
              console.error('Error upserting profile after Auth0 redirect:', err)
            } finally {
              window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname)
            }
          })()
        }}
      >
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <App />
              <Toaster />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </Auth0Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
