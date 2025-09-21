import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useUpvote, useDownvote, useUserVotes, useProposal } from '@/hooks/useProposals'
import { useToast } from '@/hooks/useToast'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface VoteSectionProps {
  proposalId: string
  compact?: boolean
  onUnverifiedClick?: () => void
}

export default function VoteSection({
  proposalId,
  compact = false,
  onUnverifiedClick
}: VoteSectionProps) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [flashColor, setFlashColor] = useState<string>('')
  const [optimisticVote, setOptimisticVote] = useState<'up' | 'down' | null>(null)

  const upvoteMutation = useUpvote()
  const downvoteMutation = useDownvote()
  const { data: userVotes } = useUserVotes()
  const { data: proposal, isLoading: proposalLoading } = useProposal(proposalId)

  const userVote = userVotes?.find(vote => vote.proposal_id === proposalId)
  const isVerified = profile?.verified_resident

  // Extract proposal data
  const { upvotes, downvotes } = proposal || { upvotes: 0, downvotes: 0 }

  // Determine current active vote type (optimistic first, then server state)
  const currentVoteType: 'up' | 'down' | null = optimisticVote ?? (userVote ? userVote.vote_type as 'up' | 'down' : null)
  const isUpActive = currentVoteType === 'up'
  const isDownActive = currentVoteType === 'down'

  // Flash animation effect
  useEffect(() => {
    if (flashColor) {
      const timer = setTimeout(() => setFlashColor(''), 300)
      return () => clearTimeout(timer)
    }
  }, [flashColor])

  // Sync optimistic state with server state when it changes
  useEffect(() => {
    setOptimisticVote(userVote ? (userVote.vote_type as 'up' | 'down') : null)
  }, [userVote?.vote_type])

  const handleUpvote = async () => {
    // Authentication temporarily disabled for demo - backend handles demo users
    // if (!user) {
    //   toast({
    //     title: "Sign in required",
    //     description: "Please sign in to vote on proposals",
    //     variant: "destructive"
    //   })
    //   return
    // }

    // Verification temporarily disabled - users can vote without verification
    // if (!isVerified) {
    //   if (onUnverifiedClick) {
    //     onUnverifiedClick()
    //   } else {
    //     toast({
    //       title: "Verification required",
    //       description: "Please verify your residency to vote on proposals",
    //       variant: "destructive"
    //     })
    //   }
    //   return
    // }

    // Flash animation
    setFlashColor('green')

    // Optimistic toggle: compute next state based on current
    const previous = currentVoteType
    const next: 'up' | 'down' | null = previous === 'up' ? null : 'up'
    setOptimisticVote(next)

    try {
      await upvoteMutation.mutateAsync(proposalId)
    } catch (error: any) {
      setFlashColor('') // Clear flash on error
      // Revert optimistic state on error
      setOptimisticVote(previous)

      toast({
        title: "Vote failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive"
      })
    }
  }

  const handleDownvote = async () => {
    // Authentication temporarily disabled for demo - backend handles demo users
    // if (!user) {
    //   toast({
    //     title: "Sign in required",
    //     description: "Please sign in to vote on proposals",
    //     variant: "destructive"
    //   })
    //   return
    // }

    // Verification temporarily disabled - users can vote without verification
    // if (!isVerified) {
    //   if (onUnverifiedClick) {
    //     onUnverifiedClick()
    //   } else {
    //     toast({
    //       title: "Verification required",
    //       description: "Please verify your residency to vote on proposals",
    //       variant: "destructive"
    //     })
    //   }
    //   return
    // }

    // Flash animation
    setFlashColor('red')

    // Optimistic toggle: compute next state based on current
    const previous = currentVoteType
    const next: 'up' | 'down' | null = previous === 'down' ? null : 'down'
    setOptimisticVote(next)

    try {
      await downvoteMutation.mutateAsync(proposalId)
    } catch (error: any) {
      setFlashColor('') // Clear flash on error
      // Revert optimistic state on error
      setOptimisticVote(previous)

      toast({
        title: "Vote failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive"
      })
    }
  }

  const renderVoteDisplay = () => {
    if (compact) {
      return (
        <div className="flex flex-col items-center gap-2">
          <div className={`text-sm font-medium ${flashColor === 'green' ? 'animate-pulse text-green-500' : flashColor === 'red' ? 'animate-pulse text-red-500' : ''}`}>
            {upvotes - downvotes}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp className={`h-4 w-4 ${isUpActive ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-xs text-muted-foreground">{upvotes}</span>
            <ArrowDown className={`h-4 w-4 ${isDownActive ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="text-xs text-muted-foreground">{downvotes}</span>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Vote count in the middle */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${flashColor === 'green' ? 'animate-pulse text-green-500' : flashColor === 'red' ? 'animate-pulse text-red-500' : ''}`}>
            {upvotes - downvotes}
          </div>
          <div className="text-sm text-muted-foreground">
            {upvotes} positive • {downvotes} negative
          </div>
        </div>

        {/* Vote buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleUpvote(); }}
            disabled={upvoteMutation.isPending || downvoteMutation.isPending}
            className={`flex items-center gap-1 ${
              isUpActive
                ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                : ''
            }`}
            title="Upvote this proposal"
          >
            <ArrowUp className="h-4 w-4" />
            Upvote
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleDownvote(); }}
            disabled={upvoteMutation.isPending || downvoteMutation.isPending}
            className={`flex items-center gap-1 ${
              isDownActive
                ? 'bg-red-600 text-white hover:bg-red-700 border-red-600'
                : ''
            }`}
            title="Downvote this proposal"
          >
            <ArrowDown className="h-4 w-4" />
            Downvote
          </Button>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (proposalLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto mt-2" />
        </div>
        <div className="flex gap-2 justify-center">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    )
  }

  // Handle error state
  if (!proposal) {
    return <div>Proposal not found</div>
  }

  // Authentication temporarily disabled for demo
  // if (!user || !isVerified) {
  // if (!user) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {renderVoteDisplay()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          "Click to vote"
        </TooltipContent>
      </Tooltip>
    )
  // }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          {renderVoteDisplay()}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {userVote && userVote.vote_type === 'up' ? "You've upvoted this proposal" :
         userVote && userVote.vote_type === 'down' ? "You've downvoted this proposal" :
         "Click to vote"}
      </TooltipContent>
    </Tooltip>
  )
}
