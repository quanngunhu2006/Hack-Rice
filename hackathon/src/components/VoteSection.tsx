import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useUpvote, useDownvote, useUserVotes } from '@/hooks/useProposals'
import { useToast } from '@/hooks/useToast'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface VoteSectionProps {
  proposalId: string
  upvotes: number
  downvotes: number
  compact?: boolean
  onUnverifiedClick?: () => void
}

export default function VoteSection({
  proposalId,
  upvotes,
  downvotes,
  compact = false,
  onUnverifiedClick
}: VoteSectionProps) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(upvotes)
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(downvotes)

  const upvoteMutation = useUpvote()
  const downvoteMutation = useDownvote()
  const { data: userVotes } = useUserVotes()

  const userVote = userVotes?.find(vote => vote.proposal_id === proposalId)
  const isVerified = profile?.verified_resident
  const totalVotes = optimisticUpvotes + optimisticDownvotes

  // Calculate percentages
  const upvotePercentage = totalVotes > 0 ? Math.round((optimisticUpvotes / totalVotes) * 100) : 50
  const downvotePercentage = totalVotes > 0 ? Math.round((optimisticDownvotes / totalVotes) * 100) : 50

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on proposals",
        variant: "destructive"
      })
      return
    }

    if (!isVerified) {
      if (onUnverifiedClick) {
        onUnverifiedClick()
      } else {
        toast({
          title: "Verification required",
          description: "Please verify your residency to vote on proposals",
          variant: "destructive"
        })
      }
      return
    }

    // Optimistic update
    const isCurrentlyUpvoted = userVote?.vote_type === 'up'
    const isCurrentlyDownvoted = userVote?.vote_type === 'down'

    if (isCurrentlyUpvoted) {
      // Remove upvote
      setOptimisticUpvotes(prev => prev - 1)
    } else {
      // Add upvote
      setOptimisticUpvotes(prev => prev + 1)
      // Remove downvote if it exists
      if (isCurrentlyDownvoted) {
        setOptimisticDownvotes(prev => prev - 1)
      }
    }

    try {
      await upvoteMutation.mutateAsync(proposalId)
    } catch (error: any) {
      // Rollback optimistic update
      setOptimisticUpvotes(upvotes)
      setOptimisticDownvotes(downvotes)

      toast({
        title: "Vote failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive"
      })
    }
  }

  const handleDownvote = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on proposals",
        variant: "destructive"
      })
      return
    }

    if (!isVerified) {
      if (onUnverifiedClick) {
        onUnverifiedClick()
      } else {
        toast({
          title: "Verification required",
          description: "Please verify your residency to vote on proposals",
          variant: "destructive"
        })
      }
      return
    }

    // Optimistic update
    const isCurrentlyDownvoted = userVote?.vote_type === 'down'
    const isCurrentlyUpvoted = userVote?.vote_type === 'up'

    if (isCurrentlyDownvoted) {
      // Remove downvote
      setOptimisticDownvotes(prev => prev - 1)
    } else {
      // Add downvote
      setOptimisticDownvotes(prev => prev + 1)
      // Remove upvote if it exists
      if (isCurrentlyUpvoted) {
        setOptimisticUpvotes(prev => prev - 1)
      }
    }

    try {
      await downvoteMutation.mutateAsync(proposalId)
    } catch (error: any) {
      // Rollback optimistic update
      setOptimisticUpvotes(upvotes)
      setOptimisticDownvotes(downvotes)

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
          <div className="flex items-center gap-1">
            <ArrowUp className={`h-4 w-4 ${userVote?.vote_type === 'up' ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">{optimisticUpvotes}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDown className={`h-4 w-4 ${userVote?.vote_type === 'down' ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">{optimisticDownvotes}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {upvotePercentage}% / {downvotePercentage}%
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Vote counts and percentages */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <ArrowUp className={`h-5 w-5 ${userVote?.vote_type === 'up' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-2xl font-bold">{optimisticUpvotes}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDown className={`h-5 w-5 ${userVote?.vote_type === 'down' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="text-2xl font-bold">{optimisticDownvotes}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {upvotePercentage}% positive • {downvotePercentage}% negative
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {totalVotes} total votes
          </div>
        </div>

        {/* Vote buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={userVote?.vote_type === 'up' ? "default" : "outline"}
            size="sm"
            onClick={handleUpvote}
            disabled={(!user || !isVerified) || upvoteMutation.isPending || downvoteMutation.isPending}
            className="flex items-center gap-1"
          >
            <ArrowUp className="h-4 w-4" />
            Upvote
          </Button>
          <Button
            variant={userVote?.vote_type === 'down' ? "destructive" : "outline"}
            size="sm"
            onClick={handleDownvote}
            disabled={(!user || !isVerified) || upvoteMutation.isPending || downvoteMutation.isPending}
            className="flex items-center gap-1"
          >
            <ArrowDown className="h-4 w-4" />
            Downvote
          </Button>
        </div>
      </div>
    )
  }

  if (!user || !isVerified) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer" onClick={handleUpvote}>
            {renderVoteDisplay()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {!user ? "Sign in to vote" : "Verify residency to vote"}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          {renderVoteDisplay()}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {userVote?.vote_type === 'up' ? "You've upvoted this proposal" :
         userVote?.vote_type === 'down' ? "You've downvoted this proposal" :
         "Click to vote"}
      </TooltipContent>
    </Tooltip>
  )
}
