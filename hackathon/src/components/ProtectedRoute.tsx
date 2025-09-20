import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireVerified?: boolean
}

export default function ProtectedRoute({ children, requireVerified = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireVerified && profile && !profile.verified_resident) {
    return <Navigate to="/account" state={{ from: location }} replace />
  }

  return <>{children}</>
}
