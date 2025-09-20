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
          window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname);
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
