import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Proposal, ProposalInsert } from '@/types/database'

interface UseProposalsOptions {
  q?: string
  category?: string | null
  sort?: 'upvotes' | 'created_at'
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
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    }
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
    enabled: !!id
  })
}

export function useCreateProposal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (proposal: Omit<ProposalInsert, 'author_id'>): Promise<Proposal> => {
      if (!user) throw new Error('Must be authenticated')

      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          ...proposal,
          author_id: user.id,
          status: 'published'
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

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const { data, error } = await supabase.rpc('cast_vote', {
        proposal_id: proposalId
      })

      if (error) throw error
      if (!data.success) throw new Error(data.message)
      
      return data
    },
    onSuccess: (_, proposalId) => {
      // Invalidate proposals and specific proposal
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] })
    }
  })
}

export function useUserVotes() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('votes')
        .select('proposal_id')
        .eq('user_id', user.id)

      if (error) throw error
      return data.map(vote => vote.proposal_id)
    },
    enabled: !!user
  })
}
