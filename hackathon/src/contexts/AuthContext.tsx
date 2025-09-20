import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: any // Auth0 user object
  profile: Profile | null
  loading: boolean
  signOut: () => void
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: auth0User, isAuthenticated, isLoading: auth0Loading, logout } = useAuth0()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('author_id', userId)
        .single()

      if (error) {
        // If profile doesn't exist or schema cache is stale, create one
        if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.code === '406') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              author_id: userId,
              email: (auth0User?.email as string) || `${userId}@placeholder.local`,
              full_name: (auth0User?.name as string) || null,
              given_name: (auth0User as any)?.given_name || null,
              family_name: (auth0User as any)?.family_name || null,
              nickname: (auth0User as any)?.nickname || null,
              picture: (auth0User?.picture as string) || null,
              email_verified: Boolean((auth0User as any)?.email_verified),
              connection: (auth0User?.sub as string)?.split('|')[0] || null
            }])
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            return null
          }
          return newProfile
        }
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!auth0User?.sub) throw new Error('No user logged in')

    // Remove author_id from updates if it exists (can't update primary key)
    const { author_id, ...updateData } = updates

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('author_id', auth0User.sub)
      .select()
      .single()

    if (error) throw error

    setProfile(data)
  }

  useEffect(() => {
    const initializeAuth = async () => {
      if (auth0Loading) return

      if (isAuthenticated && auth0User) {
        try {
          const userProfile = await fetchProfile(auth0User.sub!)
          setProfile(userProfile)
        } catch (error) {
          console.error('Error initializing auth:', error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    initializeAuth()
  }, [auth0User, isAuthenticated, auth0Loading])

  const value: AuthContextType = {
    user: auth0User,
    profile,
    loading: loading || auth0Loading,
    signOut: logout,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider')
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
