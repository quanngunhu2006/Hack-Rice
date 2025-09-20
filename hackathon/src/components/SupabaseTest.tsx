import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested')
  const [proposals, setProposals] = useState<any[]>([])
  const [authStatus, setAuthStatus] = useState<string>('Checking...')
  const [testInsert, setTestInsert] = useState<string>('Not tested')
  const { user, profile, loading } = useAuth()

  const testAuth = async () => {
    if (loading) {
      setAuthStatus('Loading...')
      return
    }

    if (!user) {
      setAuthStatus('Not authenticated')
      return
    }

    setAuthStatus(`Auth0 Auth: ${user.email} | Verified Resident: ${profile?.verified_resident ? 'Yes' : 'No'}`)
  }

  useEffect(() => {
    testAuth()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus('Testing...')

      // Test basic connection by fetching proposals
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .limit(5)

      if (error) {
        setConnectionStatus(`Error: ${error.message}`)
        return
      }

      setProposals(data || [])
      setConnectionStatus(`Connected! Found ${data?.length || 0} proposals`)

    } catch (error) {
      setConnectionStatus(`Connection failed: ${error}`)
    }
  }

  const testProposalInsert = async () => {
    try {
      setTestInsert('Testing insert...')

      if (!user) {
        setTestInsert('Error: User not authenticated')
        return
      }

      if (!profile?.verified_resident) {
        setTestInsert('Error: User is not a verified resident. Use "Mark as Verified Resident" button first.')
        return
      }

      const testProposal = {
        title: 'Test Proposal - Please Delete',
        summary: 'This is a test proposal to verify database permissions',
        category: 'Other' as 'Other',
        author_id: user.sub!,
        status: 'published' as 'published', // Use published to match the RLS policy
        upvotes: 0
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert([testProposal])
        .select()
        .single()

      if (error) {
        setTestInsert(`Insert Error: ${error.message} (Code: ${error.code})`)
        console.error('Insert error details:', error)
        return
      }

      setTestInsert(`Insert Success! Created proposal ID: ${data.id}`)

      // Clean up the test proposal
      await supabase.from('proposals').delete().eq('id', data.id)

    } catch (error) {
      setTestInsert(`Insert Failed: ${error}`)
      console.error('Test insert error:', error)
    }
  }

  const makeVerifiedResident = async () => {
    try {
      if (!user) {
        alert('User not authenticated')
        return
      }

      const { updateProfile } = useAuth()
      await updateProfile({ verified_resident: true })

      alert('Successfully marked as verified resident!')
      testAuth() // Refresh auth status

    } catch (error) {
      alert(`Failed to update profile: ${error}`)
    }
  }

  const testMinimalProposal = async () => {
    try {
      setTestInsert('Testing minimal insert...')

      // Test with a minimal proposal that matches exactly what RLS expects
      const testProposal = {
        title: 'Minimal Test',
        summary: 'Test',
        category: 'Other' as 'Other',
        author_id: 'test-user-id', // This will fail but show us the exact error
        status: 'published' as 'published',
        upvotes: 0
      }

      console.log('Attempting minimal insert:', testProposal)

      const { data, error } = await supabase
        .from('proposals')
        .insert([testProposal])
        .select()
        .single()

      if (error) {
        setTestInsert(`Minimal Insert Error: ${error.message} (Code: ${error.code})`)
        console.error('Minimal insert error details:', error)
        return
      }

      setTestInsert(`Minimal Insert Success! Created proposal ID: ${data.id}`)

    } catch (error) {
      setTestInsert(`Minimal Insert Failed: ${error}`)
      console.error('Minimal insert error:', error)
    }
  }

  const testRLSBypass = async () => {
    try {
      setTestInsert('Testing RLS bypass...')

      // Test reading from profiles table (should work if auth is set up)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (profilesError) {
        setTestInsert(`RLS Bypass Error: ${profilesError.message} (Code: ${profilesError.code})`)
        console.error('Profiles read error:', profilesError)
        return
      }

      setTestInsert(`RLS Bypass Success! Found ${profiles?.length || 0} profiles`)

    } catch (error) {
      setTestInsert(`RLS Bypass Failed: ${error}`)
      console.error('RLS bypass error:', error)
    }
  }

  const debugAuth0Token = async () => {
    try {
      // This is a debug function to test Auth0 token retrieval
      const token = await new Promise((resolve, reject) => {
        // Use a timeout to prevent hanging
        setTimeout(() => reject(new Error('Token retrieval timeout')), 10000)

        // Try to get the token
        const auth0 = (window as any).auth0
        if (auth0 && auth0.getTokenSilently) {
          auth0.getTokenSilently()
            .then(resolve)
            .catch(reject)
        } else {
          reject(new Error('Auth0 not available'))
        }
      })

      console.log('Auth0 token retrieved successfully:', token)
      alert('Auth0 token retrieved successfully! Check console for details.')

    } catch (error) {
      console.error('Auth0 token retrieval failed:', error)
      alert(`Auth0 token retrieval failed: ${error}`)
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Supabase Connection Test</h3>

      {/* Authentication Status */}
      <div className="border-t pt-2">
        <div className="flex gap-2 mb-2 flex-wrap">
          <h4 className="font-medium text-sm">Authentication Status:</h4>
          <button
            onClick={makeVerifiedResident}
            className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
          >
            Mark as Verified Resident
          </button>
          <button
            onClick={debugAuth0Token}
            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
          >
            Debug Auth0 Token
          </button>
        </div>
        <p className="text-sm text-gray-600">{authStatus}</p>
      </div>

      {/* Connection Test */}
      <div className="border-t pt-2">
        <div className="flex gap-2 mb-2">
          <button
            onClick={testConnection}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Test Connection
          </button>
          <button
            onClick={testAuth}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Refresh Auth
          </button>
        </div>
        <p className="text-sm text-gray-600">Status: {connectionStatus}</p>
      </div>

      {/* Insert Test */}
      <div className="border-t pt-2">
        <div className="flex gap-2 mb-2 flex-wrap">
          <button
            onClick={testProposalInsert}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
          >
            Test Proposal Insert
          </button>
          <button
            onClick={testMinimalProposal}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Test Minimal Insert
          </button>
          <button
            onClick={testRLSBypass}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Test RLS Bypass
          </button>
        </div>
        <p className="text-sm text-gray-600">Insert Status: {testInsert}</p>
      </div>

      {proposals.length > 0 && (
        <div className="border-t pt-2">
          <h4 className="font-medium text-sm mb-2">Recent Proposals:</h4>
          <ul className="text-sm space-y-1">
            {proposals.map((proposal) => (
              <li key={proposal.id} className="truncate">
                {proposal.title} - {proposal.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
