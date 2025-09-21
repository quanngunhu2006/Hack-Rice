import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Proposal, ProposalInsert } from '@/types/database'
import { getAnonymousUserId } from '@/lib/utils'

interface UseProposalsOptions {
  q?: string
  category?: string | null
  sort?: 'upvotes' | 'created_at' | 'location_hint'
}

export function useProposals(options: UseProposalsOptions = {}) {
  const { q = '', category = null, sort = 'created_at' } = options

  return useQuery({
    queryKey: ['proposals', { q, category, sort }],
    queryFn: async (): Promise<Proposal[]> => {
      let query = supabase
        .from('proposals')
        .select('*')
        .in('status', ['published', 'petitioning'])

      // Search filter
      if (q) {
        query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
      }

      // Category filter
      if (category) {
        query = query.eq('category', category as any)
      }

      // Sorting
      if (sort === 'upvotes') {
        query = query.order('upvotes', { ascending: false })
      } else if (sort === 'location_hint') {
        query = query.order('location_hint', { ascending: true })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    staleTime: 0, // Always refetch fresh data
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  })
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async (): Promise<Proposal | null> => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    },
    enabled: !!id,
    staleTime: 0, // Always refetch fresh data
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  })
}

export function useCreateProposal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (proposal: Omit<ProposalInsert, 'author_id'>): Promise<Proposal> => {
      if (!user) throw new Error('Must be authenticated')

      // Always create proposals as draft so they appear in admin moderation
      const status = 'draft'

      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          ...proposal,
          author_id: user.sub, // Auth0 uses 'sub' as the user ID
          status
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    }
  })
}

export function useUpvote() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      // Call with exact parameter names matching function signature
      const userId = user?.sub || getAnonymousUserId()
      const { data, error } = await supabase.rpc('cast_vote', ({
        proposal_id: proposalId,
        vote_direction: 'up',
        user_id: userId
      } as any))

      if (error) throw error
      if (!data.success) throw new Error(data.message)

      return data
    },
    onSuccess: (_, proposalId) => {
      // Invalidate proposals, specific proposal, and user votes
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
      queryClient.invalidateQueries({ queryKey: ['user-votes'] })
    }
  })
}

export function useDownvote() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      // Call with exact parameter names matching function signature
      const userId = user?.sub || getAnonymousUserId()
      const { data, error } = await supabase.rpc('cast_vote', ({
        proposal_id: proposalId,
        vote_direction: 'down',
        user_id: userId
      } as any))

      if (error) throw error
      if (!data.success) throw new Error(data.message)

      return data
    },
    onSuccess: (_, proposalId) => {
      // Invalidate specific queries - proposals and user-votes are handled by upvote
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
    }
  })
}

export function useUserVotes() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-votes', user?.sub || getAnonymousUserId()],
    queryFn: async () => {
      const userId = user?.sub || getAnonymousUserId()
      if (!userId) return []

      const { data, error } = await supabase
        .from('votes')
        .select('proposal_id, vote_type')
        .eq('author_id', userId)

      if (error) {
        console.error('Error fetching user votes:', error)
        throw error
      }

      return data.map(vote => ({
        proposal_id: vote.proposal_id,
        vote_type: vote.vote_type
      }))
    },
    enabled: true,
    staleTime: 0, // Always refetch when component mounts
    gcTime: 0, // Don't cache the data
  })
}

export function useMyProposals() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-proposals', user?.sub],
    queryFn: async (): Promise<Proposal[]> => {
      if (!user) return []

      // Fetch all proposals authored by the current user, newest first
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('author_id', user.sub)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}